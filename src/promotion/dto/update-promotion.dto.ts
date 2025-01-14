import { IsOptional, IsString} from 'class-validator';

export class UpdatePromotionDto {
  @IsOptional()
  @IsString()
  userId?: string;
}