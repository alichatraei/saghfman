import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export interface RequestUser {
  id: string;
  phone: string;
  role: UserRole;
}

export const CurrentUser = createParamDecorator(
  (data: keyof RequestUser | undefined, ctx: ExecutionContext): RequestUser | string => {
    const request = ctx.switchToHttp().getRequest<{ user: RequestUser }>();
    return data ? request.user[data] : request.user;
  },
);
