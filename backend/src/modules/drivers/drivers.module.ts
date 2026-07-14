import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';
import { DriverRepository } from './repositories/driver.repository';
import { Driver, DriverSchema } from './drivers.schema';
import { AuditLog, AuditLogSchema } from '../../database/schemas/audit-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Driver.name, schema: DriverSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  controllers: [DriversController],
  providers: [DriversService, DriverRepository],
  exports: [DriversService, DriverRepository],
})
export class DriversModule {}
