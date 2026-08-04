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
} from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  /**
   * POST /api/reminders
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateReminderDto,
  ) {
    return this.remindersService.create(userId, dto);
  }

  /**
   * GET /api/reminders
   * Hanya mengembalikan reminder aktif, diurutkan berdasarkan waktu terdekat.
   */
  @Get()
  async findAll(@CurrentUser('id') userId: string) {
    return this.remindersService.findAll(userId);
  }

  /**
   * GET /api/reminders/:id
   */
  @Get(':id')
  async findOne(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.remindersService.findOne(id, userId);
  }

  /**
   * PATCH /api/reminders/:id
   */
  @Patch(':id')
  async update(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReminderDto,
  ) {
    return this.remindersService.update(id, userId, dto);
  }

  /**
   * DELETE /api/reminders/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.remindersService.delete(id, userId);
  }
}
