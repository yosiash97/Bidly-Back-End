import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { BidsService } from 'src/bids/bids.service';

@Controller('task')
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly bidService: BidsService
    ) {}
  @Get()
  findAll() {
    return this.taskService.executeGptScraper();
  }

  @Get('distance')
  async dummy(@Query('sliderValue') sliderValue: number) {
    let records = await this.bidService.findAll();
    const homeDistance = `POINT 37.3387 121.8853`;
    let homeLat = 37.3387
    let homeLong = -121.8853

    let filtered_records = await this.bidService.findBidsWithinDistance(homeLat, homeLong, sliderValue)
    console.log("Filtered Records -> ", filtered_records)
    await new Promise(resolve => setTimeout(resolve, 2000));

    return filtered_records
  }

  // @Get('distance')
  // async dummy(@Query('sliderValue') sliderValue: number) {
  //   console.log("Slider value:", sliderValue);
  //   await new Promise(resolve => setTimeout(resolve, 2000));

  //   return [
  //     {"id": 1, "city": "San Jose", "status": "CLOSED", "name": "San Jose Pedestrian Bridge redesign due to structural issues."}, 
  //     {"id": 2, "city": "Oakland", "status": "OPEN", "name": "Oakland City Center, design bike lane for Middle School students biking to school."}, 
  //     {"id": 3, "city": "Berkeley", "status": "PENDING", "name": "UC Berkeley, redesign Shattuck to allow tram through middle. (35 MPH max speed)."},
  //     {"id": 4, "city": "San Luis Obispo", "status": "CLOSED", "name": "San Luis Obispo lane, bridge over river for animals"},
  //     {"id": 5, "city": "Contra Costa","status": "OPEN", "name": "Contra Costa lane highway design."},
  //     {"id": 6, "city": "Hayward", "status": 'OPEN', "name": "Hayward lane redesign"},
  //     {"id": 7, "city": "South San Francisco", "status": 'OPEN', "name": "South SF lane redesign"},
  //   ]
  //   };
}
