import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsArray, IsEnum, Min, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMedicineDto {
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

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  activeIngredient?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  activeIngredientAr?: string;

  @ApiProperty({ enum: ['TABLET', 'CAPSULE', 'LIQUID', 'SYRUP', 'SUSPENSION', 'INJECTION', 'DROPS', 'CREAM', 'OINTMENT', 'GEL', 'SUPPOSITORY', 'INHALER', 'PATCH', 'POWDER', 'SPRAY', 'SOLUTION', 'EYE_DROPS', 'EAR_DROPS', 'NASAL_SPRAY', 'TOPICAL'] })
  @IsEnum(['TABLET', 'CAPSULE', 'LIQUID', 'SYRUP', 'SUSPENSION', 'INJECTION', 'DROPS', 'CREAM', 'OINTMENT', 'GEL', 'SUPPOSITORY', 'INHALER', 'PATCH', 'POWDER', 'SPRAY', 'SOLUTION', 'EYE_DROPS', 'EAR_DROPS', 'NASAL_SPRAY', 'TOPICAL'])
  dosageForm: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  strength: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  manufacturerAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  images?: { url: string; alt?: string; isPrimary?: boolean }[];

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceAfterDiscount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  wholesalePrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  profitMargin?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  minimumStockLevel?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maximumStockLevel?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  reorderPoint?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPrescriptionRequired?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isControlled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  requiresColdChain?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  storageConditions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  sideEffects?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  contraindications?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  interactions?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dosageInstructions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dosageInstructionsAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiryDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  batchNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoDescription?: string;
}
