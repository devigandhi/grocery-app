import { IsString, Matches } from 'class-validator';

export class LoginDto {
  @Matches(/^\+?[1-9]\d{7,14}$/, {
    message: 'phoneNumber must be a valid phone number (E.164-like format)',
  })
  phoneNumber!: string;

  @IsString()
  password!: string;
}
