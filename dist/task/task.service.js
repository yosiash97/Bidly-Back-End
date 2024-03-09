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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const child_process_1 = require("child_process");
const fs = require("fs");
const axios_1 = require("@nestjs/axios");
let TaskService = class TaskService {
    constructor(httpService) {
        this.httpService = httpService;
        this.jsonFilePath = "/Users/yosiashailu/Desktop/bidly-backend/cities.json";
        this.outputData = [];
    }
    async executeGptScraper() {
        try {
            const jsonFileContent = fs.readFileSync(this.jsonFilePath, 'utf-8');
            const urls = JSON.parse(jsonFileContent);
            const promises = [];
            for (let [city, url] of Object.entries(urls)) {
                promises.push(this.scrapeLatestBids(String(url), city));
            }
            await Promise.all(promises);
            console.log("End of Execution: ", this.outputData);
        }
        catch (error) {
            console.error('Error executing GPT scraper:', error);
        }
    }
    async scrapeLatestBids(url, city) {
        console.log("Scraping");
        try {
            const escapedCity = city.replace(/ /g, '\\ ');
            console.log("Escaped: ", escapedCity);
            (0, child_process_1.exec)(`python /Users/yosiashailu/desktop/bidly-backend/scraper.py "${url}" "${city}"`, (error, stdout, stderr) => {
                if (error) {
                    console.error('Error executing Python script:', error);
                    return;
                }
                console.log("Stdout: ", stdout);
                const jsonStartIndex = stdout.indexOf('[{');
                const jsonEndIndex = stdout.lastIndexOf('}]');
                if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
                    const jsonString = stdout.substring(jsonStartIndex, jsonEndIndex + 2);
                    console.log('JSON String:', jsonString);
                    try {
                        const dataArray = JSON.parse(jsonString);
                        this.outputData.push(dataArray);
                    }
                    catch (jsonError) {
                        console.error('Error parsing JSON:', jsonError);
                    }
                }
                if (stderr) {
                    console.error('Python script error:', stderr);
                }
            });
        }
        catch (error) {
            console.error('Error executing Python script for: ', city, error);
        }
    }
};
exports.TaskService = TaskService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TaskService.prototype, "executeGptScraper", null);
exports.TaskService = TaskService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], TaskService);
//# sourceMappingURL=task.service.js.map