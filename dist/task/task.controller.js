"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const common_1 = require("@nestjs/common");
const task_service_1 = require("./task.service");
const bids_service_1 = require("../bids/bids.service");
let TaskController = class TaskController {
    constructor(taskService, bidService) {
        this.taskService = taskService;
        this.bidService = bidService;
    }
    findAll() {
        return this.taskService.executeGptScraper();
    }
    async dummy(sliderValue) {
        console.log("Head to Delilah2");
        let records = await this.bidService.findAll();
        const homeDistance = `POINT 37.3387 121.8853`;
        let homeLat = 37.3387;
        let homeLong = -121.8853;
        let filtered_records = await this.bidService.findBidsWithinDistance(homeLat, homeLong, sliderValue);
        console.log("Filtered Records -> ", filtered_records);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return filtered_records;
    }
};
exports.TaskController = TaskController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TaskController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('distance'),
    __param(0, (0, common_1.Query)('sliderValue')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "dummy", null);
exports.TaskController = TaskController = __decorate([
    (0, common_1.Controller)('task'),
    __metadata("design:paramtypes", [task_service_1.TaskService,
        bids_service_1.BidsService])
], TaskController);
//# sourceMappingURL=task.controller.js.map