import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreatePromotionDto {
  @IsNumber()
  @IsOptional()
  userId?: number;

  @IsNumber()
  @IsNotEmpty()
  typeId: number;
}