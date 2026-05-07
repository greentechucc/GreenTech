import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserData {
  userId: string;
  email: string;
  role: string;
  name: string;
}

/**
 * Extracts user info from x-user-* headers injected by the API Gateway.
 * Usage: @CurrentUser() user: CurrentUserData
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserData => {
    const request = ctx.switchToHttp().getRequest();
    return {
      userId: request.headers['x-user-id'] || '',
      email: request.headers['x-user-email'] || '',
      role: request.headers['x-user-role'] || '',
      name: request.headers['x-user-name'] || '',
    };
  },
);
