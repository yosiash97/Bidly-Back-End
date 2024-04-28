import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { PrismaService } from 'src/prisma.service';
export declare class BidsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createBidDto: CreateBidDto): Promise<{
        id: number;
        title: string;
        status: string;
        url: string;
        location: string;
        city: string;
        bid_type: string;
    }>;
    findAll(): Promise<{
        id: number;
        title: string;
        status: string;
        url: string;
        location: string;
        city: string;
        bid_type: string;
    }[]>;
    findBidsWithinDistance(homeLat: number, homeLong: number, sliderValue: number): Promise<unknown>;
    findBidsbyTypeAndDistance(sliderValue: number, bid_type: string): Promise<unknown>;
    findOne(id: number): string;
    update(id: number, updateBidDto: UpdateBidDto): string;
    remove(id: number): string;
}
