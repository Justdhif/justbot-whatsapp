import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  
  @Public()
  @Get()
  getRoot() {
    return {
      name: 'JustBot API',
      version: '1.0.0',
      description: 'REST API for JustBot — Finance & Reminder management',
      status: 'online',
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        finance: '/api/finance',
        reminders: '/api/reminders',
      },
    };
  }
}
