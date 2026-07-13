import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoyaltyPointsController } from './loyalty-points.controller';
import { LoyaltyPointsService } from './loyalty-points.service';
import { LoyaltyPoints, LoyaltyPointsSchema } from '../../database/schemas/loyalty-points.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LoyaltyPoints.name, schema: LoyaltyPointsSchema },
    ]),
  ],
  controllers: [LoyaltyPointsController],
  providers: [LoyaltyPointsService],
  exports: [LoyaltyPointsService],
})
export class LoyaltyPointsModule {}
