import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';
import { DriverRepository } from './repositories/driver.repository';
import { DriverProfile, DriverProfileSchema } from './drivers.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DriverProfile.name, schema: DriverProfileSchema },
    ]),
  ],
  controllers: [DriversController],
  providers: [DriversService, DriverRepository],
  exports: [DriversService, DriverRepository],
})
export class DriversModule {}
