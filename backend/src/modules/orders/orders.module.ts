import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order, OrderSchema } from '../../database/schemas/order.schema';
import { Cart, CartSchema } from '../../database/schemas/cart.schema';
import { Medicine, MedicineSchema } from '../../database/schemas/medicine.schema';
import { Coupon, CouponSchema } from '../../database/schemas/coupon.schema';
import { Invoice, InvoiceSchema } from '../../database/schemas/invoice.schema';
import { AuditLog, AuditLogSchema } from '../../database/schemas/audit-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Cart.name, schema: CartSchema },
      { name: Medicine.name, schema: MedicineSchema },
      { name: Coupon.name, schema: CouponSchema },
      { name: Invoice.name, schema: InvoiceSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
