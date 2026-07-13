import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  preferences?: {
    language?: string;
    darkMode?: boolean;
    notifications?: boolean;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fcmToken?: string;
}
