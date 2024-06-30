import { HttpService } from '@nestjs/axios';
import { BidsService } from 'src/bids/bids.service';
import { PrismaService } from 'src/prisma.service';
export declare class TaskService {
    private readonly httpService;
    private readonly bidsService;
    private prisma;
    constructor(httpService: HttpService, bidsService: BidsService, prisma: PrismaService);
    private readonly jsonFilePath;
    private readonly outputData;
    executeGptScraper(): Promise<void>;
    private scrapeLatestBidsWithDelay;
    private delay;
    private loadScrapedBidsIntoDB;
    private scrapeLatestBids;
    private promisifyExec;
}
