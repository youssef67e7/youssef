import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { TopUpDto } from './dto/top-up.dto';
import { TransferDto } from './dto/transfer.dto';
import { DeductDto } from './dto/deduct.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Wallet')
@Controller('wallet')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get wallet balance' })
  async getBalance(@CurrentUser('sub') userId: string) {
    return this.walletService.getBalance(userId);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get transaction history' })
  async getTransactions(
    @CurrentUser('sub') userId: string,
    @Query() query: any,
  ) {
    return this.walletService.getTransactionHistory(userId, query);
  }

  @Post('top-up')
  @ApiOperation({ summary: 'Top up wallet' })
  async topUp(
    @CurrentUser('sub') userId: string,
    @Body() dto: TopUpDto,
  ) {
    return this.walletService.topUp(userId, dto);
  }

  @Post('deduct')
  @ApiOperation({ summary: 'Deduct from wallet' })
  async deduct(
    @CurrentUser('sub') userId: string,
    @Body() dto: DeductDto,
  ) {
    return this.walletService.deduct(userId, dto);
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Transfer to another wallet' })
  async transfer(
    @CurrentUser('sub') userId: string,
    @Body() dto: TransferDto,
  ) {
    return this.walletService.transfer(userId, dto);
  }
}
