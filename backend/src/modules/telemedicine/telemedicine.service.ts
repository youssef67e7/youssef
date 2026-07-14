import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { TelemedicineRepository } from './telemedicine.repository';
import { CreateDoctorDto, UpdateDoctorDto, UpdateAppointmentDto } from './dto/telemedicine.dto';

@Injectable()
export class TelemedicineService {
  private readonly logger = new Logger(TelemedicineService.name);
  constructor(private readonly repo: TelemedicineRepository) {}

  async getDoctors(query: any = {}) {
    const filter: any = { isActive: true };
    if (query.specialization) filter.specialization = query.specialization;
    const data = await this.repo.findAllDoctors(filter);
    return { message: 'Doctors retrieved', data };
  }

  async getDoctor(id: string) {
    const doc = await this.repo.findDoctor(id);
    if (!doc) throw new NotFoundException('Doctor not found');
    return { message: 'Doctor retrieved', data: doc };
  }

  async createDoctor(dto: CreateDoctorDto) {
    const doc = await this.repo.createDoctor(dto);
    this.logger.log(`Doctor created: ${doc.name}`);
    return { message: 'Doctor created', data: doc };
  }

  async updateDoctor(id: string, dto: UpdateDoctorDto) {
    const doc = await this.repo.findDoctor(id);
    if (!doc) throw new NotFoundException('Doctor not found');
    const updated = await this.repo.updateDoctor(id, dto);
    return { message: 'Doctor updated', data: updated };
  }

  async deleteDoctor(id: string) {
    const doc = await this.repo.findDoctor(id);
    if (!doc) throw new NotFoundException('Doctor not found');
    await this.repo.deleteDoctor(id);
    return { message: 'Doctor deleted' };
  }

  async getAppointments(query: any = {}) {
    const filter: any = {};
    if (query.status) filter.status = query.status;
    const data = await this.repo.findAllAppointments(filter);
    return { message: 'Appointments retrieved', data };
  }

  async updateAppointment(id: string, dto: UpdateAppointmentDto) {
    const appt = await this.repo.findAppointment(id);
    if (!appt) throw new NotFoundException('Appointment not found');
    const updated = await this.repo.updateAppointment(id, dto);
    return { message: 'Appointment updated', data: updated };
  }
}
