import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../auth/common/interfaces/jwt-payload.interface'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    // 토근유효 검증
    const secretOrKey = configService.get<string>('JWT_SECRET');
    if (!secretOrKey) throw new Error('secretOrKey is not defined');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey,
    });
  }

  // 유저 정보 추출
  async validate(payload: JwtPayload) {
    return { userId: payload.userId, role: payload.role };
  }
}
