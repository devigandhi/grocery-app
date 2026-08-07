import { IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
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
}
