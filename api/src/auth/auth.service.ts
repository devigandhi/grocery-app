import { Inject, Injectable } from '@nestjs/common';
import { AUTH } from './auth.constants';
import type { Auth } from './auth.instance';

@Injectable()
export class AuthService {
  constructor(@Inject(AUTH) readonly auth: Auth) {}
}
