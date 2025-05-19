import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  @UseGuards(JwtAuthGuard) //JWT 인증 필요 지정
  @Get('user')
  getUser(@Req() req : Request & { user: { userId: string; username: string; role: string } }) {
    return req.user; // JwtStrategy의 validate()에서 리턴한 값
  }
}
