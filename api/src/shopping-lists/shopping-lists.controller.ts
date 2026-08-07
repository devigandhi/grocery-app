import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/current-user.type';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ShoppingListsService } from './shopping-lists.service';

@Controller('shopping-lists')
@UseGuards(AuthGuard)
export class ShoppingListsController {
  constructor(private readonly shoppingListsService: ShoppingListsService) {}

  @Get('me')
  findMine(@CurrentUser() user: CurrentUserPayload) {
    return this.shoppingListsService.findMyLists(user.id);
  }

  @Post('items')
  addItem(@CurrentUser() user: CurrentUserPayload, @Body() dto: AddItemDto) {
    return this.shoppingListsService.addItem(user.id, dto);
  }

  @Patch('items/:id')
  updateItem(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateItemDto,
  ) {
    return this.shoppingListsService.updateItem(user.id, id, dto);
  }

  @Delete('items/:id')
  removeItem(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.shoppingListsService.removeItem(user.id, id);
  }
}
