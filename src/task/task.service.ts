import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { exec } from 'child_process';
import * as fs from 'fs';
import { HttpService } from '@nestjs/axios';
import { Observable } from 'rxjs';
import { toArray } from 'rxjs/operators';
import { stderr } from 'process';

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

      // After all data is collected, you can insert it into the database
      // this.insertIntoDatabase(this.outputData);
    } catch (error) {
      console.error('Error executing GPT scraper:', error);
    }
  }

  private async scrapeLatestBids(url: string, city: string): Promise<void> {
    try {
      const escapedCity = city.replace(/ /g, '\\ '); 
      exec(`python /Users/yosiashailu/desktop/bidly-backend/scraper.py "${url}" "${city}"`, (error, stdout, stderr) => {
        if (error) {
          console.error('Error executing Python script:', error);
          return;
        }
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
      });
    } catch (error) {
      console.error('Error executing Python script for: ', city, error);
    }
  }

  // Method to insert data into the database
  // private insertIntoDatabase(data: any[]) {
  //   // Insert data into the database
  // }
}
