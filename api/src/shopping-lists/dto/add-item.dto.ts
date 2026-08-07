import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Unit } from '../../../generated/prisma/enums';

export class AddItemDto {
  @IsString()
  groceryId!: string;

  @IsNumber()
  @IsPositive()
  quantity!: number;

  @IsEnum(Unit)
  unit!: Unit;

  @IsOptional()
  @IsString()
  shopId?: string;
}
