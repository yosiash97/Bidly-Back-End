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
                promises.push(this.scrapeLatestBids(String(url), city));
            }
            await Promise.all(promises);
            await this.loadScrapedBidsIntoDB();
            console.log("Output: ", this.outputData);
        }
        catch (error) {
            console.error('Error executing GPT scraper:', error);
        }
    }
    async loadScrapedBidsIntoDB() {
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
        console.log("In scrape");
        try {
            console.log("in try");
            const escapedCity = city.replace(/ /g, '\\ ');
            console.log("Command -> ", `python3 scraper.py "${url}" "${escapedCity}"`);
            console.log(`UID: ${process.getuid()}`);
            console.log(`GID: ${process.getgid()}`);
            const { stdout, stderr } = await this.promisifyExec(`/app/venv/bin/python3 scraper.py "${url}" "${escapedCity}"`);
            const jsonStartIndex = stdout.indexOf('[{');
            const jsonEndIndex = stdout.lastIndexOf('}]');
            if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
                const jsonString = stdout.substring(jsonStartIndex, jsonEndIndex + 2);
                try {
                    const dataArray = JSON.parse(jsonString);
                    this.outputData.push(...dataArray);
                    console.log("in try: ", dataArray);
                }
                catch (jsonError) {
                    console.log("Json error: ");
                    console.error('Error parsing JSON:', jsonError);
                }
            }
            if (stderr) {
                console.log("in stderr if");
                console.error('Python script error:', stderr);
            }
        }
        catch (error) {
            console.log("in catch error");
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
exports.TaskService = TaskService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        bids_service_1.BidsService,
        prisma_service_1.PrismaService])
], TaskService);
//# sourceMappingURL=task.service.js.map