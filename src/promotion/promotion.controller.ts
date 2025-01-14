import { Controller, Get, Post, Body, Param, Delete, UsePipes, ValidationPipe, Query } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { CreatePromotionTypeDto } from './dto/create-promotion-type.dto';
import { UpdatePromotionTypeDto } from './dto/update-promotion-type.dto';

@Controller('promotion')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) { }

  @Post('partner/create')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() createPromotionDto: CreatePromotionDto) {
    return this.promotionService.create(createPromotionDto);
  }

  @Post('partner/type/create')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async createType(@Body() createPromotionTypeDto: CreatePromotionTypeDto) {
    return this.promotionService.createType(createPromotionTypeDto);
  }

  @Post('partner/bulk-create')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async bulkCreate(@Body() data: { typeId: number; amount: number; promotionData: Omit<CreatePromotionDto, 'typeId'>; }) {
    return this.promotionService.bulkCreate(data.typeId, data.amount, data.promotionData);
  }

  @Get('partner/list')
  async findAll(@Query('perPage') perPage: number, @Query('page') page: number) {
    return this.promotionService.findAll(Number(perPage), Number(page));
  }

  @Get('partner/type/list')
  async findAllTypes(@Query('perPage') perPage: number, @Query('page') page: number) {
    return this.promotionService.findAllTypes(Number(perPage), Number(page));
  }

  @Get('user/list/:userId')
  async getPromotionsByUser(
    @Param('userId') userId: string,
    @Query('perPage') perPage: number,
    @Query('page') page: number,
  ) {
    return this.promotionService.findByUserId(userId, Number(perPage), Number(page));
  }

  @Get('user/type/list/:partnerId')
  async getTypesByPartner(
    @Param('partnerId') partnerId: string,
    @Query('perPage') perPage: number,
    @Query('page') page: number,
  ) {
    return this.promotionService.findByPartnerId(partnerId, Number(perPage), Number(page));
  }

  @Get('user/get/:id')
  async findOne(@Param('id') id: string) {
    return this.promotionService.findOne(id);
  }

  @Get('unauthen/type/get/:id')
  async findTypeById(@Param('id') id: number) {
    return this.promotionService.findOneType(Number(id));
  }

  @Post('partner/update/:id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(@Param('id') id: string, @Body() updatePromotionDto: UpdatePromotionDto) {
    return this.promotionService.update(id, updatePromotionDto);
  }

  @Post('partner/type/update/:id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async updateType(@Param('id') id: number, @Body() updatePromotionTypeDto: UpdatePromotionTypeDto) {
    return this.promotionService.updateType(Number(id), updatePromotionTypeDto);
  }

  @Delete('partner/remove/:id')
  async remove(@Param('id') id: string) {
    return this.promotionService.remove(id);
  }

  @Delete('partner/type/remove/:id')
  async removeType(@Param('id') id: number) {
    return this.promotionService.removeType(Number(id));
  }

  @Post('unauthen/redeem/:id')
  async redeem(@Param('id') id: string, @Body('phoneNumber') phoneNumber: string, @Body('userId') userId: string) {
    return this.promotionService.redeem(id, phoneNumber, userId);
  }

  @Post('unauthen/redeem/code/:code')
  async redeemPromotion(@Param('code') code: string, @Body('phoneNumber') phoneNumber: string, @Body('userId') userId: string) {
    return this.promotionService.redeemByCode(code, phoneNumber, userId);
  }

  @Get('unauthen/status/:id')
  async checkStatus(@Param('id') id: string) {
    return this.promotionService.checkStatus(id);
  }

  @Get('unauthen/encrypt/:id')
  async generateEncryptedCode(@Param('id') id: string) {
    return this.promotionService.generateEncryptedCode(id);
  }

  @Post('unauthen/assign')
  async assignPromotion(@Body('userId') userId: string, @Body('promotionType') promotionType: number) {
    return await this.promotionService.assignPromotion(userId, promotionType);
  }
}