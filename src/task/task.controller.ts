import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, Ip } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { BidsService } from 'src/bids/bids.service';
import { IpGeolocationService } from 'src/ip-geolocation.service'

@Controller('task')
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly bidService: BidsService,
    private readonly ipGeolocationService: IpGeolocationService
    
    ) {}
  @Get()
  findAll() {
    return this.taskService.executeGptScraper();
  }

  @Get('distance')
  async dummy(@Ip() ipAddress, @Query('sliderValue') sliderValue: number) {
    const ip = ipAddress;
    let records = await this.bidService.findAll();

    let ip_response = this.ipGeolocationService.getGeolocation(ip)
    let clientLat = ip_response['ll'][0];
    let clientLong = ip_response['ll'][1]
    let filtered_records = await this.bidService.findBidsWithinDistance(clientLat, clientLong, sliderValue)
    console.log("Filtered Records -> ", filtered_records)
    await new Promise(resolve => setTimeout(resolve, 2000));

    return filtered_records
  }
}
