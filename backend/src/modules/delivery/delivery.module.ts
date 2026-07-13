import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';
import { Delivery, DeliverySchema } from '../../database/schemas/delivery.schema';
import { Driver, DriverSchema } from '../../database/schemas/driver.schema';
import { Order, OrderSchema } from '../../database/schemas/order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Delivery.name, schema: DeliverySchema },
      { name: Driver.name, schema: DriverSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  controllers: [DeliveryController],
  providers: [DeliveryService],
  exports: [DeliveryService],
})
export class DeliveryModule {}
