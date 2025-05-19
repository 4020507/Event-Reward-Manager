import { IsString } from 'class-validator';

export class MonsterKillLogDto {
  @IsString()
  monsterName!: string;
}