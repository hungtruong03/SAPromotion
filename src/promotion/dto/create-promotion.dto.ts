import { IsNotEmpty, IsOptional, IsString, IsEnum, IsNumber, IsDate } from 'class-validator';
import { DiscountType } from '@prisma/client';

export class CreatePromotionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

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
  expiresAt?: Date;

  @IsNumber()
  @IsOptional()
  userId?: number;

  @IsNumber()
  @IsNotEmpty()
  typeId: number;
}