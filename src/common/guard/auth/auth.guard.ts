import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { PUBLIC_KEY } from '../../decorator/public/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const is_public = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (is_public) return true;

    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const header = req.headers['authorization'];

    if (!header)
      throw new UnauthorizedException('authorization header is required');

    if (!header.startsWith('Bearer '))
      throw new UnauthorizedException('invalid authorization header format');

    const token = header.split(' ')[1];

    if (!token) throw new UnauthorizedException('token is required');

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET ?? 'my_secret_key',
      });

      req.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('invalid token');
    }
  }
}
