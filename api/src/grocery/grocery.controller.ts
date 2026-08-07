import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateGroceryDto } from './dto/create-grocery.dto';
import { GroceryQueryDto } from './dto/grocery-query.dto';
import { UpdateGroceryDto } from './dto/update-grocery.dto';
import { GroceryService } from './grocery.service';

@Controller('grocery')
@UseGuards(AuthGuard, RolesGuard)
export class GroceryController {
  constructor(private readonly groceryService: GroceryService) {}

  @Get()
  findAll(@Query() query: GroceryQueryDto) {
    return this.groceryService.findAll(query);
  }

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateGroceryDto) {
    return this.groceryService.create(dto);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGroceryDto) {
    return this.groceryService.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groceryService.remove(id);
  }
}
