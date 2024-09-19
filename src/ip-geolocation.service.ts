import { Injectable } from '@nestjs/common';
import * as geoip from 'geoip-lite';

@Injectable()
export class IpGeolocationService {
  getGeolocation(ip: string): any {
    console.log("IP: ", ip)
    const geo = geoip.lookup(ip);
    if (!geo) {
      throw new Error('Failed to fetch geolocation');
    }
    return geo;
  }
}
