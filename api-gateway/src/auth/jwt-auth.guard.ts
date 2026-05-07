import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, SetMetadata } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Allow CORS Preflight OPTIONS requests
    if (request.method === 'OPTIONS') {
      return true;
    }

    // Check if route is marked as @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

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
    } catch (error: any) {
      throw new UnauthorizedException('Token inválido. Raw token recuperado mide ' + (token ? token.length : 0) + ' caracteres: [' + token + ']. Detalle: ' + (error?.message || 'Desconocido'));
    }
  }
}
