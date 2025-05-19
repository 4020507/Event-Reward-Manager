import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Monster } from '@libs/schemas/monster.schema';
import { User, UserDocument } from '@libs/schemas/user.schema';
import { MonsterKillLog } from '@libs/schemas/monster-kill-log.schema';
import { CreateMonsterDto } from './dto/create-monster.dto';
import { MonsterKillLogDto } from './dto/monster-kill-log.dto';
import { UserType } from '../common/enum/user-type.enum'

@Injectable()
export class MonsterService {
  constructor(
    @InjectModel(Monster.name) private monsterModel: Model<Monster>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(MonsterKillLog.name) private monsterKillLogModel: Model<MonsterKillLog>,
  ) {}

  async createMonster(dto: CreateMonsterDto, userId: string) {
    const user = await this.userModel.findOne({ id: userId });
    if (!user || user.type !== UserType.MASTER) {
      throw new ForbiddenException('운영자만 몬스터를 등록할 수 있습니다.');
    }

    const exists = await this.monsterModel.findOne({ name: dto.name });
    if (exists) throw new BadRequestException('이미 존재하는 몬스터입니다.');

    return new this.monsterModel(dto).save();
  }

  async killMonster(dto: MonsterKillLogDto, userId: string) {
    const user = await this.userModel.findOne({ id: userId });
    if (!user || user.type !== UserType.USER) {
      throw new ForbiddenException('유저만 몬스터를 잡을 수 있습니다.');
    }

    const monster = await this.monsterModel.findOne({ name: dto.monsterName });
    if (!monster) {
      throw new BadRequestException('존재하지 않는 몬스터입니다.');
    }

    await this.monsterKillLogModel.create({
      userId,
      monsterName: dto.monsterName,
    });

    return { message: `${dto.monsterName} 처치 완료!` };
  }
}
