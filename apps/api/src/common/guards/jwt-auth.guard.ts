import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Rejects the request when no valid access token is present. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
