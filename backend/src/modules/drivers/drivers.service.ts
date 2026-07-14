import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { DriverRepository } from './repositories/driver.repository';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Injectable()
export class DriversService {
  private readonly logger = new Logger(DriversService.name);
  constructor(private readonly driverRepository: DriverRepository) {}

  async create(dto: CreateDriverDto) {
    const existing = await this.driverRepository.findAll({ email: dto.email });
    if (existing.length > 0) throw new BadRequestException('Driver with this email already exists');
    const driver = await this.driverRepository.create(dto);
    return { message: 'Driver created successfully', data: driver };
  }

  async findAll(query: any = {}) {
    const filter: any = { deletedAt: null };
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const result = await this.driverRepository.paginate(filter, { page, limit });
    return { message: 'Drivers retrieved', data: result.data, meta: result.meta };
  }

  async findById(id: string) {
    const driver = await this.driverRepository.findById(id);
    if (!driver || driver.deletedAt) throw new NotFoundException('Driver not found');
    return { message: 'Driver retrieved', data: driver };
  }

  async update(id: string, dto: UpdateDriverDto) {
    const driver = await this.driverRepository.findById(id);
    if (!driver || driver.deletedAt) throw new NotFoundException('Driver not found');
    const updated = await this.driverRepository.update(id, dto);
    return { message: 'Driver updated', data: updated };
  }

  async remove(id: string) {
    const driver = await this.driverRepository.findById(id);
    if (!driver || driver.deletedAt) throw new NotFoundException('Driver not found');
    await this.driverRepository.softDelete(id);
    return { message: 'Driver deleted' };
  }

  async setOnline(id: string, isOnline: boolean) {
    const driver = await this.driverRepository.findById(id);
    if (!driver) throw new NotFoundException('Driver not found');
    const updated = await this.driverRepository.update(id, { isOnline });
    return { message: `Driver ${isOnline ? 'online' : 'offline'}`, data: updated };
  }

  async getEarnings(id: string) {
    const driver = await this.driverRepository.findById(id);
    if (!driver) throw new NotFoundException('Driver not found');
    return { message: 'Earnings retrieved', data: { totalEarnings: driver.totalEarnings, totalDeliveries: driver.totalDeliveries, rating: driver.rating } };
  }
}
