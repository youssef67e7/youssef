import { IsNumber, IsNotEmpty, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStockDto {
  @ApiProperty({ enum: ['add', 'subtract', 'set'] })
  @IsEnum(['add', 'subtract', 'set'])
  @IsNotEmpty()
  operation: 'add' | 'subtract' | 'set';

  @ApiProperty()
  @IsNumber()
  @Min(0)
  quantity: number;
}
