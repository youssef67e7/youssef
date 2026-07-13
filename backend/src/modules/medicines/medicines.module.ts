import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MedicinesController } from './medicines.controller';
import { MedicinesService } from './medicines.service';
import { MedicineRepository } from './repositories/medicine.repository';
import { Medicine, MedicineSchema } from '../../database/schemas/medicine.schema';
import { AuditLog, AuditLogSchema } from '../../database/schemas/audit-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Medicine.name, schema: MedicineSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  controllers: [MedicinesController],
  providers: [MedicinesService, MedicineRepository],
  exports: [MedicinesService, MedicineRepository],
})
export class MedicinesModule {}
