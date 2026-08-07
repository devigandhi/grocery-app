import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth.service';
import { toFetchHeaders } from '../node-headers.util';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const session = await this.authService.auth.api.getSession({
      headers: toFetchHeaders(req.headers),
    });
    if (!session?.user) {
      throw new UnauthorizedException();
    }
    req.user = {
      id: session.user.id,
      name: session.user.name,
      phoneNumber: session.user.phoneNumber,
      role: session.user.role as 'ADMIN' | 'USER',
    };
    return true;
  }
}
