import { IsOptional, IsNumber} from 'class-validator';

export class UpdatePromotionDto {
  @IsOptional()
  @IsNumber()
  userId?: number;
}