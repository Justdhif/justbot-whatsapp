import { IsArray, IsBoolean, IsOptional, IsString, MaxLength, Matches, IsNumber } from 'class-validator';

export class UpdateBotConfigurationDto {
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  effectiveDays?: number[];

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'effectiveHourStart must be in HH:MM format' })
  effectiveHourStart?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'effectiveHourEnd must be in HH:MM format' })
  effectiveHourEnd?: string;

  @IsOptional()
  @IsBoolean()
  isMaintenance?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  timezone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  customWelcomeMessage?: string;
}
