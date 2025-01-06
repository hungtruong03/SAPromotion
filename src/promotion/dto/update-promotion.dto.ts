import { IsString, IsOptional, IsEnum, IsNumber, IsDate } from 'class-validator';
import { DiscountType } from '@prisma/client';
import { Transform } from 'class-transformer';

export class UpdatePromotionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType;

  @IsOptional()
  @IsNumber()
  discountValue?: number;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : value))
  expiresAt?: Date;

  @IsOptional()
  @IsNumber()
  typeId?: number;
}