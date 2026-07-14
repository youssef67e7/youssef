import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiPrescriptionsController } from './ai-prescriptions.controller';
import { AiPrescriptionsService } from './ai-prescriptions.service';
import { PrescriptionAnalysis, PrescriptionAnalysisSchema } from './ai-prescriptions.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PrescriptionAnalysis.name, schema: PrescriptionAnalysisSchema },
    ]),
  ],
  controllers: [AiPrescriptionsController],
  providers: [AiPrescriptionsService],
  exports: [AiPrescriptionsService],
})
export class AiPrescriptionsModule {}
