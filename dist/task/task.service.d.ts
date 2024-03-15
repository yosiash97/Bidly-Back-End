import { HttpService } from '@nestjs/axios';
import { BidsService } from 'src/bids/bids.service';
export declare class TaskService {
    private readonly httpService;
    private readonly bidsService;
    constructor(httpService: HttpService, bidsService: BidsService);
    private readonly jsonFilePath;
    private readonly outputData;
    executeGptScraper(): Promise<void>;
    private loadScrapedBidsIntoDB;
    private scrapeLatestBids;
    private promisifyExec;
}
