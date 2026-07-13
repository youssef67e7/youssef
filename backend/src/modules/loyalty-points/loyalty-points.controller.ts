import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LoyaltyPointsService } from './loyalty-points.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Loyalty Points')
@Controller('loyalty-points')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LoyaltyPointsController {
  constructor(private readonly loyaltyPointsService: LoyaltyPointsService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get loyalty points balance' })
  async getBalance(@CurrentUser('sub') userId: string) {
    return this.loyaltyPointsService.getBalance(userId);
  }

  @Get('tier-benefits')
  @ApiOperation({ summary: 'Get tier benefits' })
  async getTierBenefits(@CurrentUser('sub') userId: string) {
    return this.loyaltyPointsService.getTierBenefits(userId);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get transaction history' })
  async getTransactions(
    @CurrentUser('sub') userId: string,
    @Query() query: any,
  ) {
    return this.loyaltyPointsService.getTransactionHistory(userId, query);
  }

  @Post('redeem')
  @ApiOperation({ summary: 'Redeem loyalty points' })
  async redeemPoints(
    @CurrentUser('sub') userId: string,
    @Body('points') points: number,
    @Body('orderId') orderId: string,
  ) {
    return this.loyaltyPointsService.redeemPoints(userId, points, orderId);
  }
}
