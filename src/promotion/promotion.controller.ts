import { Controller, Get, Post, Body, Param, Delete, UsePipes, ValidationPipe } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { CreatePromotionTypeDto } from './dto/create-promotion-type.dto';
import { UpdatePromotionTypeDto } from './dto/update-promotion-type.dto';

@Controller('promotion')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) { }

  @Post('create')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() createPromotionDto: CreatePromotionDto) {
    return this.promotionService.create(createPromotionDto);
  }

  @Post('type/create')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async createType(@Body() createPromotionTypeDto: CreatePromotionTypeDto) {
    return this.promotionService.createType(createPromotionTypeDto);
  }

  @Post('bulk-create')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async bulkCreate(@Body() data: { typeId: number; amount: number; promotionData: Omit<CreatePromotionDto, 'typeId'>; }) {
    return this.promotionService.bulkCreate(data.typeId, data.amount, data.promotionData);
  }

  @Get('list')
  async findAll() {
    return this.promotionService.findAll();
  }

  @Get('type/list')
  async findAllTypes() {
    return this.promotionService.findAllTypes();
  }

  @Get('list/:userId')
  async getPromotionsByUser(@Param('userId') userId: number) {
    return this.promotionService.findByUserId(Number(userId));
  }

  @Get('type/list/:partnerId')
  async getTypesByPartner(@Param('partnerId') partnerId: number) {
    return this.promotionService.findByPartnerId(Number(partnerId));
  }

  @Get('get/:id')
  async findOne(@Param('id') id: string) {
    return this.promotionService.findOne(id);
  }

  @Get('type/get/:id')
  async findTypeById(@Param('id') id: number) {
    return this.promotionService.findOneType(Number(id));
  }

  @Post('update/:id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(@Param('id') id: string, @Body() updatePromotionDto: UpdatePromotionDto) {
    return this.promotionService.update(id, updatePromotionDto);
  }

  @Post('type/update/:id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async updateType(@Param('id') id: number, @Body() updatePromotionTypeDto: UpdatePromotionTypeDto) {
    return this.promotionService.updateType(Number(id), updatePromotionTypeDto);
  }

  @Delete('remove/:id')
  async remove(@Param('id') id: string) {
    return this.promotionService.remove(id);
  }

  @Delete('type/remove/:id')
  async removeType(@Param('id') id: number) {
    return this.promotionService.removeType(Number(id));
  }

  @Post('redeem/:id')
  async redeem(@Param('id') id: string, @Body('phoneNumber') phoneNumber: string, @Body('userId') userId: number) {
    return this.promotionService.redeem(id, phoneNumber, userId);
  }

  @Post('redeem/code/:code')
  async redeemPromotion(@Param('code') code: string, @Body('phoneNumber') phoneNumber: string, @Body('userId') userId: number) {
    return this.promotionService.redeemByCode(code, phoneNumber, userId);
  }

  @Get('status/:id')
  async checkStatus(@Param('id') id: string) {
    return this.promotionService.checkStatus(id);
  }

  @Get('encrypt/:id')
  async generateEncryptedCode(@Param('id') id: string) {
    return this.promotionService.generateEncryptedCode(id);
  }
}