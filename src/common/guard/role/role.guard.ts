import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from '../../decorator/roles/roles.decorator';
import { UserRole } from '../../enums';
import { Request } from 'express';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const required_role = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required_role) return true;

    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();

    const user = req.user;

    console.log(user);

    if (!user) throw new UnauthorizedException('user is not authenticated');

    const user_role = user.role as UserRole;

    const has_required_role = required_role.includes(user_role);

    if (!has_required_role) throw new ForbiddenException('Access denied');

    return true;
  }
}
