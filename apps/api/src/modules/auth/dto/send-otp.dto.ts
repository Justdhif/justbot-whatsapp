import { IsString, Matches } from 'class-validator';

export class SendOtpDto {
  @IsString()
  @Matches(/^\+?[0-9]{8,20}$/, {
    message: 'phoneNumber must be a valid phone number (8-20 digits)',
  })
  phoneNumber!: string;
}
