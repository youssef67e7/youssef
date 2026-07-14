import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { StaffRepository } from './repositories/staff.repository';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class StaffService {
  private readonly logger = new Logger(StaffService.name);

  constructor(private readonly staffRepository: StaffRepository) {}

  async create(dto: CreateStaffDto, adminId: string) {
    const existing = await this.staffRepository.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('Staff with this email already exists');
    }

    const staff = await this.staffRepository.create(dto as any);

    await this.staffRepository.logAudit({
      user: adminId,
      action: 'CREATE_STAFF',
      entity: 'Staff',
      entityId: staff._id.toString(),
      newValues: dto,
    });

    this.logger.log(`Staff created: ${staff.name}`);

    return {
      message: 'Staff created successfully',
      data: staff,
    };
  }

  async findAll(query: PaginationDto) {
    const filter = { deletedAt: null };

    const result = await this.staffRepository.paginate(filter, {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      sort: { [query.sortBy as string]: query.sortOrder === 'asc' ? 1 : -1 },
    });

    return {
      message: 'Staff retrieved successfully',
      data: result.data,
      meta: result.meta,
    };
  }

  async findById(id: string) {
    const staff = await this.staffRepository.findById(id);
    if (!staff || staff.deletedAt) {
      throw new NotFoundException('Staff not found');
    }

    return {
      message: 'Staff retrieved successfully',
      data: staff,
    };
  }

  async update(id: string, dto: UpdateStaffDto, adminId: string) {
    const staff = await this.staffRepository.findById(id);
    if (!staff || staff.deletedAt) {
      throw new NotFoundException('Staff not found');
    }

    if (dto.email && dto.email !== staff.email) {
      const existing = await this.staffRepository.findByEmail(dto.email);
      if (existing) {
        throw new BadRequestException('Staff with this email already exists');
      }
    }

    const updated = await this.staffRepository.update(id, dto as any);

    await this.staffRepository.logAudit({
      user: adminId,
      action: 'UPDATE_STAFF',
      entity: 'Staff',
      entityId: id,
      oldValues: staff.toObject(),
      newValues: dto,
    });

    this.logger.log(`Staff ${id} updated by admin ${adminId}`);

    return {
      message: 'Staff updated successfully',
      data: updated,
    };
  }

  async remove(id: string, adminId: string) {
    const staff = await this.staffRepository.findById(id);
    if (!staff || staff.deletedAt) {
      throw new NotFoundException('Staff not found');
    }

    await this.staffRepository.softDelete(id);

    await this.staffRepository.logAudit({
      user: adminId,
      action: 'DELETE_STAFF',
      entity: 'Staff',
      entityId: id,
      oldValues: { deletedAt: null },
      newValues: { deletedAt: new Date() },
    });

    this.logger.log(`Staff ${id} soft deleted by admin ${adminId}`);

    return { message: 'Staff deleted successfully' };
  }
}
