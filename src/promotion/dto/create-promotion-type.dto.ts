import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePromotionTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNotEmpty()
  partnerId: number;
}