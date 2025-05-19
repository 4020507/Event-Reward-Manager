import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { MonsterService } from './monster-service';
import { CreateMonsterDto } from './dto/create-monster.dto';
import { MonsterKillLogDto } from './dto/monster-kill-log.dto';

@Controller('monsters')
export class MonsterController {
  constructor(private readonly monsterService: MonsterService) {}


  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  async create(@Body() dto: CreateMonsterDto, @Req() req: Request) {
    return await this.monsterService.createMonster(dto, (req.user as JwtPayload).userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('kill')
  async killMonster(@Body() dto: MonsterKillLogDto, @Req() req: Request) {
    return await this.monsterService.killMonster(dto, (req.user as JwtPayload).userId);
  }
}
