import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Attaches req.user when a valid token exists but never rejects the request.
 * Used by public endpoints that behave slightly differently for logged-in
 * visitors (e.g. marking favourites) — it grants no extra data exposure.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser>(_err: Error | null, user: TUser | false): TUser | undefined {
    return user === false ? undefined : (user as TUser);
  }
}
