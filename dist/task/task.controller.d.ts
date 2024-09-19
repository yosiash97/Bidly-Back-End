import { TaskService } from './task.service';
import { BidsService } from 'src/bids/bids.service';
export declare class TaskController {
    private readonly taskService;
    private readonly bidService;
    constructor(taskService: TaskService, bidService: BidsService);
    findAll(): Promise<void>;
    dummy(sliderValue: number): Promise<unknown>;
}
