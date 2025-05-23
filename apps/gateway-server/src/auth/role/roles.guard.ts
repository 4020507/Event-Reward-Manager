import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { ROLES_KEY } from './roles.decorator';
  import { Role } from './roles.enum';
  
  @Injectable()
  export class RolesGuard implements CanActivate { // 사용자 권한 체크
    constructor(private reflector: Reflector) {}
  
    canActivate(context: ExecutionContext): boolean {
      const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );
  
      if (!requiredRoles) return true;
  
      const { user } = context.switchToHttp().getRequest();
      if (!requiredRoles.includes(user.role)) {
        throw new ForbiddenException('권한이 없습니다');
      }
  
      return true;
    }
  }
  