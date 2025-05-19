import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// jwt 유효 검증
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
