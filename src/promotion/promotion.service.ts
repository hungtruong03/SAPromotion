import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { CreatePromotionTypeDto } from './dto/create-promotion-type.dto';
import { UpdatePromotionTypeDto } from './dto/update-promotion-type.dto';
import { Redis } from 'ioredis';
import axios from 'axios';

@Injectable()
export class PromotionService {
  constructor(
    private prisma: PrismaService,
    @Inject('REDIS') private readonly redis: Redis,
    private readonly configService: ConfigService
  ) { }

  private readonly redeemApiBaseUrl = this.configService.get('REDEEM_API_BASE_URL');

  async create(data: CreatePromotionDto) {
    const { typeId, ...rest } = data;

    return this.prisma.promotion.create({
      data: {
        ...rest,
        type: {
          connect: { id: typeId },
        },
      },
    });
  }

  async findAll(perPage?: number, page?: number) {
    const validPerPage = perPage && perPage > 0 ? perPage : 10;
    const validPage = page && page > 0 ? page : 1;

    const skip = (validPage - 1) * validPerPage;

    return this.prisma.promotion.findMany({
      skip,
      take: validPerPage,
      include: { type: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.promotion.findUnique({ where: { id } });
  }

  async findByUserId(userId: string, perPage?: number, page?: number) {
    const validPerPage = perPage && perPage > 0 ? perPage : 10;
    const validPage = page && page > 0 ? page : 1;

    const skip = (validPage - 1) * validPerPage;

    return this.prisma.promotion.findMany({
      where: { userId },
      skip,
      take: validPerPage,
      include: { type: true },
    });
  }

  async update(id: string, data: Prisma.PromotionUpdateInput) {
    if (data.redeemed === false) {
      throw new BadRequestException('A redeemed promotion cannot have its status set to false.');
    }

    return this.prisma.promotion.update({
      where: { id },
      data,
      include: { type: true },
    });
  }

  async remove(id: string) {
    return this.prisma.promotion.delete({ where: { id } });
  }

  async redeem(id: string, phoneNumber: string, userId: string) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id },
      include: { type: true },
    });

    if (!promotion) {
      throw new NotFoundException('Promotion not found.');
    }

    if (promotion.redeemed) {
      throw new BadRequestException('This promotion has already been redeemed and cannot be redeemed again.');
    }

    if (promotion.userId != userId) {
      throw new BadRequestException('This promotion does not belong to the specified user.');
    }

    const currentDate = new Date();
    if (promotion.type.expiresAt && new Date(promotion.type.expiresAt) < currentDate) {
      throw new BadRequestException('This promotion has expired and cannot be redeemed.');
    }

    const { discountType, discountValue } = promotion.type;

    // await this.callRedeemApi(phoneNumber, discountType, discountValue, promotion.type.partnerId);

    return this.prisma.promotion.update({
      where: { id },
      data: {
        redeemed: true,
        redeemAt: currentDate,
      },
    });
  }

  async checkStatus(id: string) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id },
    });

    if (!promotion) {
      throw new NotFoundException('Promotion not found.');
    }

    return { redeemed: promotion.redeemed };
  }

  async createType(data: CreatePromotionTypeDto) {
    return this.prisma.promotionType.create({ data });
  }

  async findAllTypes(perPage?: number, page?: number) {
    const validPerPage = perPage && perPage > 0 ? perPage : 10;
    const validPage = page && page > 0 ? page : 1;

    const skip = (validPage - 1) * validPerPage;

    return this.prisma.promotionType.findMany({
      skip,
      take: validPerPage,
    });
  }

  async findByPartnerId(partnerId: string, perPage?: number, page?: number) {
    const validPerPage = perPage && perPage > 0 ? perPage : 10;
    const validPage = page && page > 0 ? page : 1;

    const skip = (validPage - 1) * validPerPage;

    return this.prisma.promotionType.findMany({
      where: { partnerId },
      skip,
      take: validPerPage,
    });
  }

  async findOneType(id: number) {
    return this.prisma.promotionType.findUnique({ where: { id } });
  }

  async updateType(id: number, data: UpdatePromotionTypeDto) {
    return this.prisma.promotionType.update({
      where: { id },
      data,
    });
  }

  async removeType(id: number) {
    return this.prisma.promotionType.delete({ where: { id } });
  }

  async bulkCreate(typeId: number, amount: number, promotionData: Omit<CreatePromotionDto, 'typeId'>) {
    const promotions = Array.from({ length: amount }, () => ({
      ...promotionData,
      typeId,
    }));

    return this.prisma.promotion.createMany({
      data: promotions,
      skipDuplicates: true,
    });
  }

  async generateEncryptedCode(promotionId: string): Promise<Object> {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id: promotionId },
    });

    if (!promotion) {
      throw new NotFoundException('Promotion not found.');
    }

    let randomString = this.generateRandomString(6);

    const existingCode = await this.redis.get(randomString);
    while (existingCode) {
      randomString = this.generateRandomString(6);
    }

    await this.redis.set(randomString, promotionId, 'EX', 1800);

    return { Code: randomString };
  }

  private generateRandomString(length: number): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
      randomString += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return randomString;
  }

  async setData(key: string, value: string): Promise<string> {
    await this.redis.set(key, value);
    return `Key ${key} set successfully`;
  }

  async getData(key: string): Promise<string | null> {
    const value = await this.redis.get(key);
    return value;
  }

  async redeemByCode(code: string, phoneNumber: string, userId: string) {
    const promotionId = await this.redis.get(code);

    if (!promotionId) {
      throw new BadRequestException('Invalid or expired code.');
    }

    const promotion = await this.prisma.promotion.findUnique({
      where: { id: promotionId },
      include: { type: true },
    });

    if (!promotion) {
      throw new NotFoundException('Promotion not found.');
    }

    if (promotion.redeemed) {
      throw new BadRequestException('Promotion has already been redeemed.');
    }

    if (promotion.userId != userId) {
      throw new BadRequestException('This promotion does not belong to the specified user.');
    }

    const currentDate = new Date();
    if (promotion.type.expiresAt && new Date(promotion.type.expiresAt) < currentDate) {
      throw new BadRequestException('This promotion has expired and cannot be redeemed.');
    }

    const { discountType, discountValue } = promotion.type;

    // await this.callRedeemApi(phoneNumber, discountType, discountValue, promotion.type.partnerId);

    await this.prisma.promotion.update({
      where: { id: promotionId },
      data: {
        redeemed: true,
        redeemAt: currentDate,
      },
    });

    return { message: 'Promotion redeemed successfully.' };
  }

  async callRedeemApi(phoneNumber: string, discountType: string, discountValue: number, partnerId: string) {
    const apiUrl = `${this.redeemApiBaseUrl}/api/redeem`;

    console.log('Calling Redeem API with the following data:', { phoneNumber, discountType, discountValue, partnerId });

    try {
      const response = await axios.post(apiUrl, {
        phoneNumber,
        discountType,
        discountValue,
        partnerId,
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Failed to call external Redeem API');
    }
  }

  async assignPromotion(userId: string, promotionType: number) {
    const promotion = await this.prisma.promotion.findFirst({
      where: {
        typeId: promotionType,
        userId: null,
        redeemed: false,
      },
    });

    if (!promotion) {
      throw new NotFoundException('No available promotions of the specified type.');
    }

    const updatedPromotion = await this.prisma.promotion.update({
      where: { id: promotion.id },
      data: { userId },
    });

    return { promotionId: updatedPromotion.id };
  }

  async getUsedPromotions(typeId: number, date?: string, month?: number, year?: number): Promise<any> {
    if ((!date && !month && !year) || (month && !year)) {
      throw new BadRequestException('Please provide a valid date, month, and year combination.');
    }

    const where: any = {
      redeemed: true,
      typeId
    };

    if (date) {
      const specificDate = new Date(date);
      where.redeemAt = {
        gte: new Date(specificDate.setHours(0, 0, 0, 0)),
        lt: new Date(specificDate.setHours(23, 59, 59, 999)),
      };
    } else if (month && year) {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0);
      where.redeemAt = {
        gte: startOfMonth,
        lt: new Date(endOfMonth.setHours(23, 59, 59, 999)),
      };
    } else if (year) {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);
      where.redeemAt = {
        gte: startOfYear,
        lt: endOfYear,
      };
    }

    const count = await this.prisma.promotion.count({
      where,
    });

    return { count };
  }
}