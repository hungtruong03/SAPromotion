import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDate, IsNumber } from 'class-validator';
import { DiscountType } from '@prisma/client';
import { Transform } from 'class-transformer';

export class CreatePromotionTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  partnerId: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  shortDescription?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsEnum(DiscountType)
  @IsOptional()
  discountType?: DiscountType = DiscountType.FLAT;

  @IsNumber()
  @IsOptional()
  discountValue?: number = 0;

  @IsDate()
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : value))
  expiresAt?: Date;
}