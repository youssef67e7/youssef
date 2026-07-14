import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsDateString, IsBoolean, IsArray } from 'class-validator';

export class CreatePromotionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['PERCENTAGE', 'FIXED', 'BOGO', 'FREE_SHIPPING', 'BUY_X_GET_Y'])
  type: string;

  @IsNumber()
  value: number;

  @IsOptional()
  @IsNumber()
  minPurchase?: number;

  @IsOptional()
  @IsNumber()
  maxDiscount?: number;

  @IsOptional()
  @IsNumber()
  usageLimit?: number;

  @IsOptional()
  @IsNumber()
  perUserLimit?: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  priority?: number;
}
