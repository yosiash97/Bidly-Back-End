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
        title: "Test",
        url: "Testurl",
        status: "teststatus"
      }
    })
  }

  findAll() {
    return `This action returns all bids`;
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
