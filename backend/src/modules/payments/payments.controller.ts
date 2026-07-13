import { Controller, Post, Get, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Request } from 'express';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create payment intent' })
  async createPaymentIntent(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreatePaymentIntentDto,
  ) {
    return this.paymentsService.createPaymentIntent(dto);
  }

  @Post('process')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Process payment' })
  async processPayment(
    @CurrentUser('sub') userId: string,
    @Body() dto: ProcessPaymentDto,
  ) {
    return this.paymentsService.processPayment(dto);
  }

  @Get('status/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment status' })
  @ApiParam({ name: 'orderId' })
  async getPaymentStatus(@Param('orderId') orderId: string) {
    return this.paymentsService.getPaymentStatus(orderId);
  }

  @Post('refund/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Process refund' })
  @ApiParam({ name: 'orderId' })
  async processRefund(
    @Param('orderId') orderId: string,
    @Body('amount') amount: number,
    @Body('reason') reason: string,
  ) {
    return this.paymentsService.processRefund(orderId, amount, reason);
  }

  @Post('webhook/stripe')
  @ApiOperation({ summary: 'Stripe webhook' })
  async stripeWebhook(@Req() req: Request) {
    return this.paymentsService.handleStripeWebhook(req.body);
  }

  @Post('webhook/paymob')
  @ApiOperation({ summary: 'Paymob webhook' })
  async paymobWebhook(@Req() req: Request) {
    return this.paymentsService.handlePaymobWebhook(req.body);
  }

  @Post('webhook/fawry')
  @ApiOperation({ summary: 'Fawry webhook' })
  async fawryWebhook(@Req() req: Request) {
    return this.paymentsService.handleFawryWebhook(req.body);
  }
}
