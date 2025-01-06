import { IsNotEmpty, IsOptional, IsString, IsEnum, IsNumber, IsDate } from 'class-validator';
import { DiscountType } from '@prisma/client';
import { Transform } from 'class-transformer';

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
  @Transform(({ value }) => (value ? new Date(value) : value))
  expiresAt?: Date;

  @IsNumber()
  @IsOptional()
  userId?: number;

  @IsNumber()
  @IsNotEmpty()
  typeId: number;
}