import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString, IsEnum, IsArray } from 'class-validator';

export class CreateDoctorDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() email: string;
  @IsOptional() @IsString() phone?: string;
  @IsString() @IsNotEmpty() specialization: string;
  @IsOptional() @IsString() qualification?: string;
  @IsOptional() @IsNumber() experience?: number;
  @IsOptional() @IsNumber() consultationFee?: number;
  @IsOptional() @IsArray() availableDays?: string[];
  @IsOptional() @IsString() availableFrom?: string;
  @IsOptional() @IsString() availableTo?: string;
  @IsOptional() @IsString() bio?: string;
}

export class UpdateDoctorDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() specialization?: string;
  @IsOptional() @IsString() qualification?: string;
  @IsOptional() @IsNumber() experience?: number;
  @IsOptional() @IsNumber() consultationFee?: number;
  @IsOptional() @IsArray() availableDays?: string[];
  @IsOptional() @IsString() availableFrom?: string;
  @IsOptional() @IsString() availableTo?: string;
  @IsOptional() @IsString() bio?: string;
  @IsOptional() isAvailable?: boolean;
}

export class UpdateAppointmentDto {
  @IsOptional() @IsEnum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']) status?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() prescription?: string;
}
