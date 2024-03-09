import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
export declare class BidsService {
    create(createBidDto: CreateBidDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateBidDto: UpdateBidDto): string;
    remove(id: number): string;
}
