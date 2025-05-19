import { Body, Controller, Post, Delete, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { JwtPayload } from './common/interfaces/jwt-payload.interface'
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { DeleteUserDto } from './dto/delete-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.createUser(createUserDto);
    return { message: '회원가입 성공', user };
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return { message: '로그인 성공', accessToken: await this.authService.login(dto) };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(@Req() req: Request) {
    await this.authService.logout((req.user as JwtPayload).userId);
    return { message: '로그아웃 성공' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('change-password')
  async changePassword(@Req() req: Request, @Body() dto: ChangePasswordDto) {
    await this.authService.changePassword((req.user as JwtPayload).userId, dto);
    return { message: '비밀번호 변경 성공' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('delete-account')
  async deleteAccount(@Req() req: Request, @Body() dto: DeleteUserDto) {
    await this.authService.deleteAccount((req.user as JwtPayload).userId, dto);
    return { message: '회원 탈퇴 성공' };
  }

}
