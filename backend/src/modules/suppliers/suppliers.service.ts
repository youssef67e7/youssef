import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { SupplierRepository } from './repositories/supplier.repository';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class SuppliersService {
  private readonly logger = new Logger(SuppliersService.name);

  constructor(private readonly supplierRepository: SupplierRepository) {}

  async create(dto: CreateSupplierDto, adminId: string) {
    const supplier = await this.supplierRepository.create({
      ...dto,
      totalOrders: 0,
      totalSpent: 0,
    } as any);

    await this.supplierRepository.logAudit({
      user: adminId,
      action: 'CREATE_SUPPLIER',
      entity: 'Supplier',
      entityId: supplier._id.toString(),
      newValues: dto,
    });

    this.logger.log(`Supplier created: ${supplier.name}`);

    return {
      message: 'Supplier created successfully',
      data: supplier,
    };
  }

  async findAll(query: PaginationDto) {
    const filter = { isActive: true };

    const result = await this.supplierRepository.paginate(filter, {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      sort: { [query.sortBy as string]: query.sortOrder === 'asc' ? 1 : -1 },
    });

    return {
      message: 'Suppliers retrieved successfully',
      data: result.data,
      meta: result.meta,
    };
  }

  async findById(id: string) {
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier || !supplier.isActive) {
      throw new NotFoundException('Supplier not found');
    }

    return {
      message: 'Supplier retrieved successfully',
      data: supplier,
    };
  }

  async update(id: string, dto: UpdateSupplierDto, adminId: string) {
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier || !supplier.isActive) {
      throw new NotFoundException('Supplier not found');
    }

    const updated = await this.supplierRepository.update(id, dto as any);

    await this.supplierRepository.logAudit({
      user: adminId,
      action: 'UPDATE_SUPPLIER',
      entity: 'Supplier',
      entityId: id,
      oldValues: supplier.toObject(),
      newValues: dto,
    });

    this.logger.log(`Supplier ${id} updated by admin ${adminId}`);

    return {
      message: 'Supplier updated successfully',
      data: updated,
    };
  }

  async remove(id: string, adminId: string) {
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier || !supplier.isActive) {
      throw new NotFoundException('Supplier not found');
    }

    await this.supplierRepository.update(id, { isActive: false } as any);

    await this.supplierRepository.logAudit({
      user: adminId,
      action: 'DELETE_SUPPLIER',
      entity: 'Supplier',
      entityId: id,
      oldValues: { isActive: true },
      newValues: { isActive: false },
    });

    this.logger.log(`Supplier ${id} soft deleted by admin ${adminId}`);

    return { message: 'Supplier deleted successfully' };
  }
}
