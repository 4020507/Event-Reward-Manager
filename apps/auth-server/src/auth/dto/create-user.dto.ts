import { IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  id!: string;

  @IsString()
  password!: string;

  @IsString()
  typeNm!: string;
}