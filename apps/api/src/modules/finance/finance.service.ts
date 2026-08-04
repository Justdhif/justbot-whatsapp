import { Injectable, NotFoundException } from '@nestjs/common';
import { FinanceRepository, TransactionFilters } from './finance.repository';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class FinanceService {
  constructor(private readonly financeRepository: FinanceRepository) {}

  async create(userId: string, dto: CreateTransactionDto) {
    return this.financeRepository.create({
      userId,
      type: dto.type,
      amount: dto.amount.toString(),
      category: dto.category,
      description: dto.description,
      transactionDate: dto.transactionDate,
    });
  }

  async findAll(userId: string, filters: TransactionFilters) {
    return this.financeRepository.findAll(userId, filters);
  }

  async findOne(id: string, userId: string) {
    const transaction = await this.financeRepository.findOne(id, userId);
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }

  async update(id: string, userId: string, dto: UpdateTransactionDto) {
    const transaction = await this.financeRepository.findOne(id, userId);
    if (!transaction) throw new NotFoundException('Transaction not found');

    return this.financeRepository.update(id, userId, {
      ...(dto.type && { type: dto.type }),
      ...(dto.amount !== undefined && { amount: dto.amount.toString() }),
      ...(dto.category !== undefined && { category: dto.category }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.transactionDate && { transactionDate: dto.transactionDate }),
    });
  }

  async delete(id: string, userId: string) {
    const transaction = await this.financeRepository.findOne(id, userId);
    if (!transaction) throw new NotFoundException('Transaction not found');
    return this.financeRepository.delete(id, userId);
  }

  async getSummary(userId: string, startDate?: string, endDate?: string) {
    return this.financeRepository.getSummary(userId, startDate, endDate);
  }
}
