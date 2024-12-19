import { IsString, IsOptional } from 'class-validator';

export class UpdatePromotionTypeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}