import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleSigninDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  idToken: string;
}
