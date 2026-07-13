import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProcessPaymentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ enum: ['STRIPE', 'PAYMOB', 'FAWRY', 'WALLET', 'CASH_ON_DELIVERY'] })
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @ApiPropertyOptional()
  @IsString()
  paymentToken?: string;
}
