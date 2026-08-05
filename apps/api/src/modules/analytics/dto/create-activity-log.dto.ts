import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class CreateActivityLogDto {
  @IsString()
  @IsNotEmpty()
  senderNumber: string;

  @IsString()
  @IsOptional()
  senderName?: string;

  @IsString()
  @IsNotEmpty()
  messageText: string;

  @IsEnum(['incoming', 'outgoing'])
  direction: 'incoming' | 'outgoing';

  @IsString()
  @IsOptional()
  moduleUsed?: string;

  @IsEnum(['success', 'failed', 'ignored'])
  @IsOptional()
  status?: 'success' | 'failed' | 'ignored';
}
