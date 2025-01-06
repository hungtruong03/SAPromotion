import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePromotionTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  partnerId: number;
}