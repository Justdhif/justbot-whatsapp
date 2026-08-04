import { PartialType } from '@nestjs/mapped-types';
import { CreateTransactionDto } from './create-transaction.dto';

/**
 * UpdateTransactionDto
 * Semua field dari CreateTransactionDto menjadi optional (PartialType).
 * Hanya field yang dikirim yang akan diupdate.
 */
export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {}
