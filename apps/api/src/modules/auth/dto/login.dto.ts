import { IsEmail, IsOptional, IsString, MinLength, Matches } from 'class-validator';

export class LoginDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{8,20}$/)
  phoneNumber?: string;

  @IsString()
  @MinLength(1)
  password!: string;
}
