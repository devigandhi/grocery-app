import { IsString, MinLength } from 'class-validator';

export class CreateGroceryDto {
  @IsString()
  @MinLength(1)
  item!: string;

  @IsString()
  @MinLength(1)
  category!: string;
}
