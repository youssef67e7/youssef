import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TelemedicineController } from './telemedicine.controller';
import { TelemedicineService } from './telemedicine.service';
import { TelemedicineRepository } from './telemedicine.repository';
import { TelemedDoctor, TelemedDoctorSchema, Appointment, AppointmentSchema } from './telemedicine.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TelemedDoctor.name, schema: TelemedDoctorSchema },
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
  ],
  controllers: [TelemedicineController],
  providers: [TelemedicineService, TelemedicineRepository],
  exports: [TelemedicineService, TelemedicineRepository],
})
export class TelemedicineModule {}
