import { Injectable, Inject, BadRequestException } from '@nestjs/common';
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

  async findAll() {
    return this.prisma.promotion.findMany({
      include: { type: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.promotion.findUnique({ where: { id } });
  }

  async findByUserId(userId: number) {
    return this.prisma.promotion.findMany({ where: { userId } });
  }

  async update(id: string, data: Prisma.PromotionUpdateInput) {
    if (data.redeemed === false) {
      throw new Error('A redeemed promotion cannot have its status set to false.');
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

  async redeem(id: string, phoneNumber: string) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id },
      include: { type: true },
    });

    if (!promotion) {
      throw new BadRequestException('Promotion not found.');
    }

    if (promotion.redeemed) {
      throw new Error('This promotion has already been redeemed and cannot be redeemed again.');
    }

    const { discountType, discountValue, type } = promotion;

    await this.callRedeemApi(phoneNumber, discountType, discountValue, type.partnerId);

    return this.prisma.promotion.update({
      where: { id },
      data: { redeemed: true },
    });
  }

  async checkStatus(id: string) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id },
    });

    if (!promotion) {
      throw new Error('Promotion not found.');
    }

    return { redeemed: promotion.redeemed };
  }

  async createType(data: CreatePromotionTypeDto) {
    return this.prisma.promotionType.create({ data });
  }

  async findAllTypes() {
    return this.prisma.promotionType.findMany();
  }

  async findByPartnerId(partnerId: number) {
    return this.prisma.promotionType.findMany({ where: { partnerId } });
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

  async generateEncryptedCode(promotionId: string): Promise<string> {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id: promotionId },
    });

    if (!promotion) {
      throw new Error('Promotion not found.');
    }

    let randomString = this.generateRandomString(6);

    const existingCode = await this.redis.get(randomString);
    while (existingCode) {
      randomString = this.generateRandomString(6);
    }

    await this.redis.set(randomString, promotionId, 'EX', 1800);

    return randomString;
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

  async redeemByCode(code: string, phoneNumber: string) {
    const promotionId = await this.redis.get(code);

    if (!promotionId) {
      throw new BadRequestException('Invalid or expired code.');
    }

    const promotion = await this.prisma.promotion.findUnique({
      where: { id: promotionId },
      include: { type: true },
    });

    if (!promotion) {
      throw new BadRequestException('Promotion not found.');
    }

    if (promotion.redeemed) {
      throw new BadRequestException('Promotion has already been redeemed.');
    }

    const { discountType, discountValue, type } = promotion;

    await this.callRedeemApi(phoneNumber, discountType, discountValue, type.partnerId);

    await this.prisma.promotion.update({
      where: { id: promotionId },
      data: { redeemed: true },
    });

    return { message: 'Promotion redeemed successfully.' };
  }

  async callRedeemApi(phoneNumber: string, discountType: string, discountValue: number, partnerId: number) {
    const apiUrl = `${this.redeemApiBaseUrl}/redeem`;

    try {
      const response = await axios.post(apiUrl, {
        phoneNumber,
        discountType,
        discountValue,
        partnerId,
      });
      return response.data;
    } catch (error) {
      throw new BadRequestException('Failed to call external Redeem API');
    }
  }
}