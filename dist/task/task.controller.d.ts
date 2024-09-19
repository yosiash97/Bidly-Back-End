import { TaskService } from './task.service';
import { BidsService } from 'src/bids/bids.service';
import { IpGeolocationService } from 'src/ip-geolocation.service';
export declare class TaskController {
    private readonly taskService;
    private readonly bidService;
    private readonly ipGeolocationService;
    constructor(taskService: TaskService, bidService: BidsService, ipGeolocationService: IpGeolocationService);
    findAll(): Promise<void>;
    dummy(ipAddress: any, sliderValue: number): Promise<unknown>;
}
