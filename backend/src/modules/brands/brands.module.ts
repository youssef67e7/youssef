import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BrandsController } from './brands.controller';
import { BrandsService } from './brands.service';
import { BrandRepository } from './repositories/brand.repository';
import { Brand, BrandSchema } from '../../database/schemas/brand.schema';
import { AuditLog, AuditLogSchema } from '../../database/schemas/audit-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Brand.name, schema: BrandSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  controllers: [BrandsController],
  providers: [BrandsService, BrandRepository],
  exports: [BrandsService, BrandRepository],
})
export class BrandsModule {}
