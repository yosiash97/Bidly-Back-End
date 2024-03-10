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
let TaskController = class TaskController {
    constructor(taskService) {
        this.taskService = taskService;
    }
    findAll() {
        return this.taskService.executeGptScraper();
    }
    async dummy(sliderValue) {
        console.log("Slider value:", sliderValue);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return [
            { "id": 1, "city": "San Jose", "status": "CLOSED", "name": "San Jose Pedestrian Bridge redesign due to structural issues." },
            { "id": 2, "city": "Oakland", "status": "OPEN", "name": "Oakland City Center, design bike lane for Middle School students biking to school." },
            { "id": 3, "city": "Berkeley", "status": "PENDING", "name": "UC Berkeley, redesign Shattuck to allow tram through middle. (35 MPH max speed)." },
            { "id": 4, "city": "San Luis Obispo", "status": "CLOSED", "name": "San Luis Obispo lane, bridge over river for animals" },
            { "id": 5, "city": "Contra Costa", "status": "OPEN", "name": "Contra Costa lane highway design." },
            { "id": 6, "city": "Hayward", "status": 'OPEN', "name": "Hayward lane redesign" },
            { "id": 7, "city": "South San Francisco", "status": 'OPEN', "name": "South SF lane redesign" },
        ];
    }
    ;
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
    __metadata("design:paramtypes", [task_service_1.TaskService])
], TaskController);
//# sourceMappingURL=task.controller.js.map