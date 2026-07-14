import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TelemedDoctor, TelemedDoctorDocument, Appointment, AppointmentDocument } from './telemedicine.schema';

@Injectable()
export class TelemedicineRepository {
  constructor(
    @InjectModel(TelemedDoctor.name) private doctorModel: Model<TelemedDoctorDocument>,
    @InjectModel(Appointment.name) private apptModel: Model<AppointmentDocument>,
  ) {}

  async findAllDoctors(filter: any = {}) { return this.doctorModel.find(filter).sort({ createdAt: -1 }).exec(); }
  async findDoctor(id: string) { return this.doctorModel.findById(id).exec(); }
  async createDoctor(data: any) { return this.doctorModel.create(data); }
  async updateDoctor(id: string, data: any) { return this.doctorModel.findByIdAndUpdate(id, data, { new: true }).exec(); }
  async deleteDoctor(id: string) { return this.doctorModel.findByIdAndUpdate(id, { isActive: false, deletedAt: new Date() }, { new: true }).exec(); }

  async findAllAppointments(filter: any = {}) { return this.apptModel.find(filter).sort({ createdAt: -1 }).populate('patient', 'name email').populate('doctor', 'name specialization').exec(); }
  async findAppointment(id: string) { return this.apptModel.findById(id).populate('patient', 'name email').populate('doctor', 'name specialization').exec(); }
  async updateAppointment(id: string, data: any) { return this.apptModel.findByIdAndUpdate(id, data, { new: true }).exec(); }
}
