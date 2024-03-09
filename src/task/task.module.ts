import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [TaskController],
  providers: [TaskService],
  imports: [HttpModule]
})
export class TaskModule {}
