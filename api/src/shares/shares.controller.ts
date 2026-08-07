import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/current-user.type';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CreateShareDto } from './dto/create-share.dto';
import { SharesService } from './shares.service';

@Controller('shares')
@UseGuards(AuthGuard)
export class SharesController {
  constructor(private readonly sharesService: SharesService) {}

  @Post()
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateShareDto) {
    return this.sharesService.create(user.id, dto);
  }

  @Get('received')
  findReceived(@CurrentUser() user: CurrentUserPayload) {
    return this.sharesService.findReceived(user.id);
  }

  @Get('sent')
  findSent(@CurrentUser() user: CurrentUserPayload) {
    return this.sharesService.findSent(user.id);
  }
}
