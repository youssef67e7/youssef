import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';
import { SupplierRepository } from './repositories/supplier.repository';
import { Supplier, SupplierSchema } from '../../database/schemas/supplier.schema';
import { AuditLog, AuditLogSchema } from '../../database/schemas/audit-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Supplier.name, schema: SupplierSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  controllers: [SuppliersController],
  providers: [SuppliersService, SupplierRepository],
  exports: [SuppliersService, SupplierRepository],
})
export class SuppliersModule {}
