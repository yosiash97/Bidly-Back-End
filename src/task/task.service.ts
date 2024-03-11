import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { exec } from 'child_process';
import * as fs from 'fs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class TaskService {
  constructor(private readonly httpService: HttpService) {}
  private readonly jsonFilePath = "/Users/yosiashailu/Desktop/bidly-backend/cities.json";
  private readonly outputData: any[] = [];

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
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

      console.log("Output: ", this.outputData)

      // After all data is collected, you can insert it into the database
      // this.insertIntoDatabase(this.outputData);
    } catch (error) {
      console.error('Error executing GPT scraper:', error);
    }
  }

  private async scrapeLatestBids(url: string, city: string): Promise<void> {
    console.log("In scrape");
    try {
      console.log("in try");
      const escapedCity = city.replace(/ /g, '\\ '); 
      console.log("Command -> ", `python /Users/yosiashailu/desktop/bidly-backend/scraper.py "${url}" "${escapedCity}"`);
      
      // Execute the Python script using promisified version of exec
      const { stdout, stderr } = await this.promisifyExec(`python /Users/yosiashailu/desktop/bidly-backend/scraper.py "${url}" "${escapedCity}"`);
      
      const jsonStartIndex = stdout.indexOf('[{');
      const jsonEndIndex = stdout.lastIndexOf('}]');
      if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
        const jsonString = stdout.substring(jsonStartIndex, jsonEndIndex + 2);
        try {
          const dataArray = JSON.parse(jsonString);
          this.outputData.push(dataArray);
        } catch (jsonError) {
          console.error('Error parsing JSON:', jsonError);
        }
      }
      if (stderr) {
        console.error('Python script error:', stderr);
      }
    } catch (error) {
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
