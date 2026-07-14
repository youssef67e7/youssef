import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateAnalysisDto {
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsString() rawText?: string;
  @IsOptional() @IsString() doctorName?: string;
  @IsOptional() @IsDateString() prescribedDate?: string;
}
