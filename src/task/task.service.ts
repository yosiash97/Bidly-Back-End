import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { exec } from 'child_process';
import * as fs from 'fs';
import { HttpService } from '@nestjs/axios';
import { BidsService } from 'src/bids/bids.service';
import { PrismaService } from 'src/prisma.service';
import { PrismaClient, Prisma } from '@prisma/client';
import { bid } from '@prisma/client';

@Injectable()
export class TaskService {
  constructor(
    private readonly httpService: HttpService,
    private readonly bidsService: BidsService,
    private prisma: PrismaService
    ) {}
  private readonly jsonFilePath = process.env.NODE_ENV === 'production'
  ? "cities.json"
  : "/Users/yosiashailu/Desktop/bidly-backend/cities.json";
  private readonly outputData: any[] = [];

  @Cron(new Date(Date.now() + 1 * 60 * 1000))
  async executeGptScraper() {
    try {
      const jsonFileContent = fs.readFileSync(this.jsonFilePath, 'utf-8');
      const urls = JSON.parse(jsonFileContent);

      const promises = [];

      for (let [city, url] of Object.entries(urls)) {
        promises.push(this.scrapeLatestBids(String(url), city));
      }

      // Wait for all promises to resolve
      await Promise.all(promises);
      
      await this.loadScrapedBidsIntoDB();
      console.log("Output: ", this.outputData)

      // After all data is collected, you can insert it into the database
      // this.insertIntoDatabase(this.outputData);
    } catch (error) {
      console.error('Error executing GPT scraper:', error);
    }
  }

  private async loadScrapedBidsIntoDB() {
    if (this.outputData.length == 0) {
      return;
    }
    let arrayOfBids = await this.outputData
    for (let bid of arrayOfBids ) {
      const point = `POINT(${bid['geo_location'][0]} ${bid['geo_location'][1]})`;

      try {
        await this.bidsService.create({
          title: bid.title,
          url: bid.url, 
          status: bid.status,
          location: point,
          city: bid.city,
          bid_type: bid.bid_type
        })
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          console.error(`A unique constraint violation occurred for the title: ${bid.title}. This bid already exists in the database.`);
        } else {
          console.error('An unexpected error occurred:', error);
        }
      }

    }
  }

  //From FE we have a coordinate X, Y and want to send request for all geocoordinates between 20 miles

  private async scrapeLatestBids(url: string, city: string): Promise<void> {
    console.log("In scrape");
    try {
      console.log("in try");
      const escapedCity = city.replace(/ /g, '\\ '); 
      console.log("Command -> ", `python3 scraper.py "${url}" "${escapedCity}"`);
      
      // Execute the Python script using promisified version of exec
      const { stdout, stderr } = await this.promisifyExec(`python3 ./scraper.py "${url}" "${escapedCity}"`);
      
      const jsonStartIndex = stdout.indexOf('[{');
      const jsonEndIndex = stdout.lastIndexOf('}]');
      if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
        const jsonString = stdout.substring(jsonStartIndex, jsonEndIndex + 2);
        try {
          const dataArray = JSON.parse(jsonString);
          this.outputData.push(...dataArray); // Spread dataArray and push individual elements
          console.log("in try: ", dataArray)
        } catch (jsonError) {
          console.log("Json error: ")
          console.error('Error parsing JSON:', jsonError);
        }
      }
      if (stderr) {
        console.log("in stderr if")
        console.error('Python script error:', stderr);
      }
    } catch (error) {
      console.log("in catch error")
      console.error('Error executing Python script for: ', city, error);
    }
  }

  // Promisify the exec function
  private promisifyExec(command: string): Promise<{ stdout: string, stderr: string }> {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
  }
}
