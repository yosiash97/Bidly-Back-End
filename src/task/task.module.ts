import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { HttpModule } from '@nestjs/axios';
import { BidsService } from 'src/bids/bids.service';
import { PrismaService } from 'src/prisma.service';
import { IpGeolocationService } from 'src/ip-geolocation.service'


@Module({
  controllers: [TaskController],
  providers: [TaskService, BidsService, PrismaService, IpGeolocationService],
  imports: [HttpModule]
})
export class TaskModule {}
