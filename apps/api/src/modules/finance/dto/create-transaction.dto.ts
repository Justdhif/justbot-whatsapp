import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export class CreateTransactionDto {
  @IsEnum(TransactionType, { message: 'type must be "income" or "expense"' })
  type!: TransactionType;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'amount must be a valid number with max 2 decimal places' })
  @Min(0.01, { message: 'amount must be greater than 0' })
  @Transform(({ value }) => parseFloat(value))
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsDateString({}, { message: 'transactionDate must be a valid date (YYYY-MM-DD)' })
  transactionDate!: string;
}
