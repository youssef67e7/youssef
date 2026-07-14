import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean } from 'class-validator';

export class CreateDriverDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsOptional()
  @IsEnum(['MOTORCYCLE', 'CAR', 'VAN', 'BICYCLE'])
  vehicleType?: string;

  @IsOptional()
  @IsString()
  licenseNumber?: string;
}
