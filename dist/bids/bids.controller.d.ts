import { BidsService } from './bids.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
export declare class BidsController {
    private readonly bidsService;
    constructor(bidsService: BidsService);
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
    find(sliderValue: number, bid_type: string): Promise<void>;
    update(id: string, updateBidDto: UpdateBidDto): string;
    remove(id: string): string;
}
