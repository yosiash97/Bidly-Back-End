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
const bids_service_1 = require("../bids/bids.service");
const prisma_service_1 = require("../prisma.service");
const client_1 = require("@prisma/client");
let TaskService = class TaskService {
    constructor(httpService, bidsService, prisma) {
        this.httpService = httpService;
        this.bidsService = bidsService;
        this.prisma = prisma;
        this.jsonFilePath = process.env.NODE_ENV === 'production'
            ? "cities.json"
            : "/Users/yosiashailu/Desktop/bidly-backend/cities.json";
        this.outputData = [];
    }
    async executeGptScraper() {
        try {
            const jsonFileContent = fs.readFileSync(this.jsonFilePath, 'utf-8');
            const urls = JSON.parse(jsonFileContent);
            const promises = [];
            for (let [city, url] of Object.entries(urls)) {
                await this.scrapeLatestBidsWithDelay(String(url), city);
            }
            await this.loadScrapedBidsIntoDB();
        }
        catch (error) {
            console.error('Error executing GPT scraper:', error);
        }
    }
    async scrapeLatestBidsWithDelay(url, city) {
        await this.scrapeLatestBids(url, city);
        await this.delay(30000);
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async loadScrapedBidsIntoDB() {
        console.log("Output data: ", this.outputData);
        if (this.outputData.length == 0) {
            return;
        }
        let arrayOfBids = await this.outputData;
        for (let bid of arrayOfBids) {
            const point = `POINT(${bid['geo_location'][0]} ${bid['geo_location'][1]})`;
            try {
                await this.bidsService.create({
                    title: bid.title,
                    url: bid.url,
                    status: bid.status,
                    location: point,
                    city: bid.city,
                    bid_type: bid.bid_type
                });
            }
            catch (error) {
                if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                    console.error(`A unique constraint violation occurred for the title: ${bid.title}. This bid already exists in the database.`);
                }
                else {
                    console.error('An unexpected error occurred:', error);
                }
            }
        }
    }
    async scrapeLatestBids(url, city) {
        try {
            const escapedCity = city.replace(/ /g, '\\ ');
            const pythonPath = process.env.NODE_ENV === 'production' ? '/app/venv/bin/python3' : '/Users/yosiashailu/Desktop/bidly-backend/myenv/bin/python3';
            console.log(`${pythonPath} scraper.py "${url}" "${escapedCity}"`);
            const { stdout, stderr } = await this.promisifyExec(`${pythonPath} scraper.py "${url}" "${escapedCity}"`);
            try {
                const jsonMatches = stdout.match(/\[\s*\{.*?\}\s*\]/gs);
                if (jsonMatches) {
                    const jsonString = jsonMatches[jsonMatches.length - 1];
                    try {
                        const dataArray = JSON.parse(jsonString);
                        console.log("Data Array: ", dataArray);
                        this.outputData.push(...dataArray);
                        console.log("After push: ", this.outputData);
                    }
                    catch (jsonError) {
                        console.error("Error parsing JSON string:", jsonError);
                        console.log("Raw JSON string: ", jsonString);
                    }
                    if (stderr) {
                        console.log("in stderr if");
                        console.error('Python script error:', stderr);
                    }
                }
                else {
                    throw new Error("No JSON data found in stdout");
                }
            }
            catch (jsonError) {
                console.log("Error parsing stdout as JSON:");
                console.error(jsonError);
            }
            if (stderr) {
                console.error('Python script error:', stderr);
            }
        }
        catch (error) {
            console.error('Error executing Python script for: ', city, error);
        }
    }
    promisifyExec(command) {
        return new Promise((resolve, reject) => {
            (0, child_process_1.exec)(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve({ stdout, stderr });
                }
            });
        });
    }
};
exports.TaskService = TaskService;
__decorate([
    (0, schedule_1.Cron)('0 0 * * 0'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TaskService.prototype, "executeGptScraper", null);
exports.TaskService = TaskService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        bids_service_1.BidsService,
        prisma_service_1.PrismaService])
], TaskService);
//# sourceMappingURL=task.service.js.map