import { TaskService } from './task.service';
export declare class TaskController {
    private readonly taskService;
    constructor(taskService: TaskService);
    findAll(): Promise<void>;
    dummy(sliderValue: number): Promise<{
        id: number;
        city: string;
        status: string;
        name: string;
    }[]>;
}
