import { Injectable, NotFoundException } from '@nestjs/common';
import { RemindersRepository } from './reminders.repository';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';

@Injectable()
export class RemindersService {
  constructor(private readonly remindersRepository: RemindersRepository) {}

  async create(userId: string, dto: CreateReminderDto) {
    return this.remindersRepository.create({
      userId,
      title: dto.title,
      body: dto.body,
      remindAt: new Date(dto.remindAt),
      recurrence: dto.recurrence,
    });
  }

  async findAll(userId: string) {
    return this.remindersRepository.findAll(userId);
  }

  async findOne(id: string, userId: string) {
    const reminder = await this.remindersRepository.findOne(id, userId);
    if (!reminder) throw new NotFoundException('Reminder not found');
    return reminder;
  }

  async update(id: string, userId: string, dto: UpdateReminderDto) {
    const reminder = await this.remindersRepository.findOne(id, userId);
    if (!reminder) throw new NotFoundException('Reminder not found');

    return this.remindersRepository.update(id, userId, {
      ...(dto.title && { title: dto.title }),
      ...(dto.body !== undefined && { body: dto.body }),
      ...(dto.remindAt && { remindAt: new Date(dto.remindAt) }),
      ...(dto.recurrence !== undefined && { recurrence: dto.recurrence }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    });
  }

  async delete(id: string, userId: string) {
    const reminder = await this.remindersRepository.findOne(id, userId);
    if (!reminder) throw new NotFoundException('Reminder not found');
    return this.remindersRepository.delete(id, userId);
  }
}
