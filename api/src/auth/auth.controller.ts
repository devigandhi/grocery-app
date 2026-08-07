import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from './guards/auth.guard';
import { toFetchHeaders } from './node-headers.util';
import { syntheticEmailForPhone } from './phone.util';
import { relayFetchResponse } from './response-relay.util';
import type { CurrentUserPayload } from './current-user.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const authRes = await this.authService.auth.api.signUpEmail({
      body: {
        email: syntheticEmailForPhone(dto.phoneNumber),
        password: dto.password,
        name: dto.name,
        phoneNumber: dto.phoneNumber,
      },
      headers: toFetchHeaders(req.headers),
      asResponse: true,
    });
    await relayFetchResponse(res, authRes);
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const authRes = await this.authService.auth.api.signInEmail({
      body: {
        email: syntheticEmailForPhone(dto.phoneNumber),
        password: dto.password,
      },
      headers: toFetchHeaders(req.headers),
      asResponse: true,
    });
    await relayFetchResponse(res, authRes);
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const authRes = await this.authService.auth.api.signOut({
      headers: toFetchHeaders(req.headers),
      asResponse: true,
    });
    await relayFetchResponse(res, authRes);
  }

  @UseGuards(AuthGuard)
  @Get('session')
  session(@CurrentUser() user: CurrentUserPayload) {
    return { user };
  }
}
