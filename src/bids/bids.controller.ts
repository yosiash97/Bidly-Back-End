import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { BidsService } from './bids.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';

@Controller('bids')
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post()
  create(@Body() createBidDto: CreateBidDto) {
    return this.bidsService.create(createBidDto);
  }

  @Post('distance')
  delete(@Body() bidID: number) {
    console.log("In delete distance: ", bidID['bidID'])
    return this.bidsService.deleteBid(bidID['bidID']);
  }

  @Get()
  findAll() {
    return this.bidsService.findAll();
  }

  @Get('type')
  async find(@Query('sliderValue') sliderValue: number, @Query('bidType') bid_type: string) {
    return this.bidsService.findBidsbyTypeAndDistance(sliderValue, bid_type);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBidDto: UpdateBidDto) {
    return this.bidsService.update(+id, updateBidDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bidsService.remove(+id);
  }
}
