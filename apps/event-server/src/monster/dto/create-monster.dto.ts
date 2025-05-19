import { IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMonsterDto {
  @IsString()
  name!: string;

  @IsNumber()
  @Type(() => Number)
  hp!: number;

}