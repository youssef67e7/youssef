import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReferralsService } from './referrals.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Referrals')
@Controller('referrals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get('my-code')
  @ApiOperation({ summary: 'Get referral code' })
  async getMyCode(@CurrentUser('sub') userId: string) {
    return this.referralsService.getMyCode(userId);
  }

  @Post('apply')
  @ApiOperation({ summary: 'Apply referral code' })
  async applyReferral(
    @CurrentUser('sub') userId: string,
    @Body('code') code: string,
  ) {
    return this.referralsService.applyReferral(userId, code);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get referral history' })
  async getHistory(@CurrentUser('sub') userId: string) {
    return this.referralsService.getReferralHistory(userId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get referral stats' })
  async getStats(@CurrentUser('sub') userId: string) {
    return this.referralsService.getReferralStats(userId);
  }
}
