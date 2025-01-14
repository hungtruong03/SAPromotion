import { IsNotEmpty, IsOptional, IsNumber, IsString } from 'class-validator';

export class CreatePromotionDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsNumber()
  @IsNotEmpty()
  typeId: number;
}