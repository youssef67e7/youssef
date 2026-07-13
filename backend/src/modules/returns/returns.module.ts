import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReturnsController } from './returns.controller';
import { ReturnsService } from './returns.service';
import { ReturnRequest, ReturnRequestSchema } from '../../database/schemas/return-request.schema';
import { ExchangeRequest, ExchangeRequestSchema } from '../../database/schemas/exchange-request.schema';
import { Refund, RefundSchema } from '../../database/schemas/refund.schema';
import { Order, OrderSchema } from '../../database/schemas/order.schema';
import { Wallet, WalletSchema } from '../../database/schemas/wallet.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReturnRequest.name, schema: ReturnRequestSchema },
      { name: ExchangeRequest.name, schema: ExchangeRequestSchema },
      { name: Refund.name, schema: RefundSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Wallet.name, schema: WalletSchema },
    ]),
  ],
  controllers: [ReturnsController],
  providers: [ReturnsService],
  exports: [ReturnsService],
})
export class ReturnsModule {}
