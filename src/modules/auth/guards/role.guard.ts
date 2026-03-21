import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    console.log('Required Roles:', requiredRoles);

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    console.log('User:', user); // 👈 ADD HERE
    console.log('User Role:', user?.role); // 👈 ADD HERE

    if (!user) {
      throw new ForbiddenException();
    }

    const hasRole = requiredRoles.includes(user.role);
    console.log('Has Role:', hasRole);

    if (!hasRole) {
      throw new ForbiddenException('Role mismatch');
    }

    return true;
  }
}
