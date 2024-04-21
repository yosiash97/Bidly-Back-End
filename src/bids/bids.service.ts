import { Injectable } from '@nestjs/common';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { PrismaService } from 'src/prisma.service';
import { PrismaClient } from '@prisma/client';
import { bid } from '@prisma/client';

@Injectable()
export class BidsService {
  constructor(private prisma: PrismaService) {} 
  async create(createBidDto: CreateBidDto) {
    return await this.prisma.bid.create({
      data: {
        title: createBidDto['title'],
        url: createBidDto['url'],
        status: createBidDto['status'],
        location: createBidDto['location']
      }
    })
  }

  async findAll() {
    return await this.prisma.bid.findMany();
  }

  async findBidsWithinDistance(homeLat: number, homeLong: number, sliderValue: number) {
    const radiusInMeters = sliderValue * 1609.34; // Convert miles to meters
    const locations = await this.prisma.$queryRaw`
      SELECT *, ST_DistanceSphere(
        ST_SetSRID(ST_MakePoint(${homeLong}, ${homeLat}), 4326),
        ST_SetSRID(ST_Point(ST_Y(location::geometry), ST_X(location::geometry)), 4326)
      ) AS distance_in_meters
      FROM public.bid
      WHERE ST_DistanceSphere(
        ST_SetSRID(ST_MakePoint(${homeLong}, ${homeLat}), 4326),
        ST_SetSRID(ST_Point(ST_Y(location::geometry), ST_X(location::geometry)), 4326)
      ) <= ${radiusInMeters};
    `;
  
    return locations;
  }
  
  

  findOne(id: number) {
    return `This action returns a #${id} bid`;
  }

  update(id: number, updateBidDto: UpdateBidDto) {
    return `This action updates a #${id} bid`;
  }

  remove(id: number) {
    return `This action removes a #${id} bid`;
  }
}
