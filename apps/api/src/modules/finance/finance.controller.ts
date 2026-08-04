import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { TransactionType } from './dto/create-transaction.dto';

class TransactionQueryDto {
  @IsOptional()
  @IsEnum(TransactionType)
  type?: 'income' | 'expense';

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  category?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  /**
   * POST /api/finance/transactions
   * Buat transaksi baru (income atau expense).
   */
  @Post('transactions')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.financeService.create(userId, dto);
  }

  /**
   * GET /api/finance/transactions
   * Daftar transaksi dengan filter opsional: type, startDate, endDate, category.
   * Mendukung pagination via query params: page, limit.
   */
  @Get('transactions')
  async findAll(
    @CurrentUser('id') userId: string,
    @Query() query: TransactionQueryDto,
  ) {
    return this.financeService.findAll(userId, {
      type: query.type,
      startDate: query.startDate,
      endDate: query.endDate,
      category: query.category,
      page: query.page ? Number(query.page) : 1,
      limit: query.limit ? Number(query.limit) : 20,
    });
  }

  /**
   * GET /api/finance/summary
   * Ringkasan keuangan: total pemasukan, pengeluaran, dan saldo.
   * Filter opsional: startDate, endDate.
   */
  @Get('summary')
  async getSummary(
    @CurrentUser('id') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.financeService.getSummary(userId, startDate, endDate);
  }

  /**
   * GET /api/finance/transactions/:id
   */
  @Get('transactions/:id')
  async findOne(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.financeService.findOne(id, userId);
  }

  /**
   * PATCH /api/finance/transactions/:id
   */
  @Patch('transactions/:id')
  async update(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.financeService.update(id, userId, dto);
  }

  /**
   * DELETE /api/finance/transactions/:id
   */
  @Delete('transactions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.financeService.delete(id, userId);
  }
}
