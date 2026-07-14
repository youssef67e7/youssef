import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PromotionsController } from './promotions.controller';
import { PromotionsService } from './promotions.service';
import { PromotionRepository } from './repositories/promotion.repository';
import { Promotion, PromotionSchema } from './promotions.schema';
import { AuditLog, AuditLogSchema } from '../../database/schemas/audit-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Promotion.name, schema: PromotionSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  controllers: [PromotionsController],
  providers: [PromotionsService, PromotionRepository],
  exports: [PromotionsService, PromotionRepository],
})
export class PromotionsModule {}
