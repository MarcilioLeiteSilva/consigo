import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PlatformRole } from '@prisma/client';
import { PLATFORM_ROLES_KEY } from '../decorators/platform-roles.decorator';

@Injectable()
export class PlatformRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<PlatformRole[]>(PLATFORM_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || user.scope !== 'PLATFORM_ADMIN') {
      throw new ForbiddenException('Acesso restrito à plataforma');
    }

    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Permissão insuficiente na plataforma. Requer: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
