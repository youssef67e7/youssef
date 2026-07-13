import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsEnum, IsArray, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOfferDto {
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @ApiProperty({ enum: ['PERCENTAGE', 'FIXED', 'BUY_X_GET_Y'] })
  @IsEnum(['PERCENTAGE', 'FIXED', 'BUY_X_GET_Y'])
  discountType: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  discountValue: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  buyQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  getQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  applicableMedicines?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  applicableCategories?: string[];

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
  @IsNumber()
  usageLimit?: number;
}
