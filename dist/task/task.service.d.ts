import { HttpService } from '@nestjs/axios';
export declare class TaskService {
    private readonly httpService;
    constructor(httpService: HttpService);
    private readonly jsonFilePath;
    private readonly outputData;
    executeGptScraper(): Promise<void>;
    private scrapeLatestBids;
    private promisifyExec;
}
