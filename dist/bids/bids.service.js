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
exports.BidsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let BidsService = class BidsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createBidDto) {
        return await this.prisma.bid.create({
            data: {
                title: createBidDto['title'],
                url: createBidDto['url'],
                status: createBidDto['status'],
                location: createBidDto['location'],
                city: createBidDto['city'],
                bid_type: createBidDto['bid_type'],
                deletedAt: null
            }
        });
    }
    async deleteBid(bidID) {
        let bid = await this.prisma.bid.findUnique({
            where: {
                id: bidID
            }
        });
        const updateBid = await this.prisma.bid.update({
            where: {
                id: bidID
            },
            data: {
                deletedAt: new Date(),
            },
        });
    }
    async findAll() {
        return await this.prisma.bid.findMany({
            where: {
                NOT: {
                    deletedAt: null
                }
            }
        });
    }
    async findBidsWithinDistance(homeLat, homeLong, sliderValue) {
        const radiusInMeters = sliderValue * 1609.34;
        const locations = await this.prisma.$queryRaw `
      SELECT *, ST_DistanceSphere(
        ST_SetSRID(ST_MakePoint(${homeLong}, ${homeLat}), 4326),
        ST_SetSRID(ST_Point(ST_Y(location::geometry), ST_X(location::geometry)), 4326)
      ) AS distance_in_meters
      FROM public.bid
      WHERE ST_DistanceSphere(
        ST_SetSRID(ST_MakePoint(${homeLong}, ${homeLat}), 4326),
        ST_SetSRID(ST_Point(ST_Y(location::geometry), ST_X(location::geometry)), 4326)
      ) <= ${radiusInMeters};
    `;
        return locations;
    }
    async findBidsbyTypeAndDistance(sliderValue, bid_type) {
        const radiusInMeters = sliderValue * 1609.34;
        let homeLat = 37.3387;
        let homeLong = -121.8853;
        const locations = await this.prisma.$queryRaw `
      SELECT *, ST_DistanceSphere(
        ST_SetSRID(ST_MakePoint(${homeLong}, ${homeLat}), 4326),
        ST_SetSRID(ST_Point(ST_Y(location::geometry), ST_X(location::geometry)), 4326)
      ) AS distance_in_meters
      FROM public.bid
      WHERE ST_DistanceSphere(
        ST_SetSRID(ST_MakePoint(${homeLong}, ${homeLat}), 4326),
        ST_SetSRID(ST_Point(ST_Y(location::geometry), ST_X(location::geometry)), 4326)
      ) <= ${radiusInMeters}
      AND bid_type = ${bid_type};
    `;
        return locations;
    }
    findOne(id) {
        console.log("in find one");
        return `This action returns a #${id} bid`;
    }
    update(id, updateBidDto) {
        console.log("in update");
        return `This action updates a #${id} bid`;
    }
    remove(id) {
        console.log("in remove");
        return `This action removes a #${id} bid`;
    }
};
exports.BidsService = BidsService;
exports.BidsService = BidsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BidsService);
//# sourceMappingURL=bids.service.js.map