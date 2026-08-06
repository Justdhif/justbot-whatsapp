import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';

export class CreateReminderDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsNotEmpty()
  @IsDateString({}, { message: 'remindAt must be a valid ISO 8601 datetime string' })
  remindAt!: string;

  
  @IsOptional()
  @IsString()
  @MaxLength(100)
  recurrence?: string;
}
