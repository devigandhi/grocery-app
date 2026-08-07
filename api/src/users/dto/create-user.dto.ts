import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Role } from '../../../generated/prisma/enums';

export class CreateUserDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @Matches(/^\+?[1-9]\d{7,14}$/, {
    message: 'phoneNumber must be a valid phone number (E.164-like format)',
  })
  phoneNumber!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
