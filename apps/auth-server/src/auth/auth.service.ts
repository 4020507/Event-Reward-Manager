import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '@libs/schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginLog } from 'libs/schemas/login-log.schema';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { comparePassword, hashPassword } from './common/helpers/bcrypt.helper';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(LoginLog.name) private loginLogModel: Model<LoginLog>,
    private readonly jwtService: JwtService
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    if (await this.getUserById(dto.id)) {
      throw new BadRequestException('이미 사용 중인 아이디입니다.');
    }

    const createdUser = new this.userModel({
      ...dto,
      password: await hashPassword(dto.password),
      type: this.setType(dto.typeNm),
    });
    return createdUser.save();
  }

  private setType(typeNm: string): string {
    switch (typeNm) {
      case '운영자': return '1';
      case '감시자': return '2';
      case '사용자': return '3';
      default:
        throw new BadRequestException(`알 수 없는 사용자 유형: ${typeNm}`);
    }
  }

  async login(dto: LoginDto) {
    const user = await this.getUserById(dto.id);
    if (!user) throw new NotFoundException('존재하지 않는 유저입니다');

    const isPasswordMatched = await comparePassword(dto.password, user.password);
    if (!isPasswordMatched) throw new UnauthorizedException('비밀번호가 틀렸습니다');

    await this.loginLogModel.create({ userId: user.id });

    const payload = {
      userId: user.id,
      role: user.typeNm,
    };
    
    const accessToken = this.jwtService.sign(payload);

    return accessToken;
  }

  async getUserById(id: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({ id });
  }

  async logout(userId: string) {
    console.log(`User ${userId} logged out`);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.getUserByUserId(userId);
    if (!user) throw new NotFoundException('유저 없음');

    const isPasswordMatched = await comparePassword(dto.currPassword, user.password);
    if (!isPasswordMatched) throw new UnauthorizedException('비밀번호 틀림');

    await this.userModel.updateOne(
      { id: userId },
      { password: await hashPassword(dto.newPassword) },
    );
  }

  async deleteAccount(userId: string, dto: DeleteUserDto) {
    const user = await this.getUserByUserId(userId);
    if (!user) throw new NotFoundException('유저 없음');

    const isPasswordMatched = await comparePassword(dto.password, user.password);
    if (!isPasswordMatched) throw new UnauthorizedException('비밀번호 틀림');

    await this.userModel.deleteOne({ id: userId });

    return 'success';
  }

  private async getUserByUserId(userId: string) {
    return await this.userModel.findOne({ id: userId });
  }
}
