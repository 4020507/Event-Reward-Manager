import { IsString } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  currPassword!: string;

  @IsString()
  newPassword!: string;
}
