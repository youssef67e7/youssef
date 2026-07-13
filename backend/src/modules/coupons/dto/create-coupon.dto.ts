import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsEnum, IsArray, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCouponDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nameAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ['PERCENTAGE', 'FIXED', 'FREE_SHIPPING', 'BUY_X_GET_Y'] })
  @IsEnum(['PERCENTAGE', 'FIXED', 'FREE_SHIPPING', 'BUY_X_GET_Y'])
  type: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  discountValue: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumOrderAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumDiscountAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  usageLimit?: number;

  @ApiProperty()
  @IsDateString()
  startDate: Date;

  @ApiProperty()
  @IsDateString()
  endDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isSingleUse?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  perUserLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  applicableCategories?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  applicableMedicines?: string[];
}
