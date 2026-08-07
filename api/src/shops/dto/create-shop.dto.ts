import { IsString, MinLength } from 'class-validator';

export class CreateShopDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  location!: string;
}
