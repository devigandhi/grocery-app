import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateGroceryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  item?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  category?: string;
}
