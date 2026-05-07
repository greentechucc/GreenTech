import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route is marked as @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const path = request.path?.toLowerCase() || '';

    // Public auth routes (login, register, password reset, etc.)
    const publicPaths = [
      '/crm/auth/login',
      '/portal/auth/login',
      '/portal/auth/register',
      '/portal/auth/forgot-password',
      '/portal/auth/verify-reset-code',
      '/portal/auth/reset-password',
      '/portal/auth/unlock',
    ];

    if (publicPaths.some(p => path.startsWith(p))) {
      return true;
    }

    // Extract and validate JWT
    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de autenticación requerido');
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = this.jwtService.verify(token);
      // Attach user info to request for downstream use
      request['user'] = {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
        name: payload.name,
      };
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
