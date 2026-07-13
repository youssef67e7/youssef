import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { MedicineRepository } from './repositories/medicine.repository';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { MedicineQueryDto } from './dto/medicine-query.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

@Injectable()
export class MedicinesService {
  private readonly logger = new Logger(MedicinesService.name);

  constructor(private readonly medicineRepository: MedicineRepository) {}

  async create(dto: CreateMedicineDto, adminId: string) {
    const medicineSlug = slugify(dto.name);

    const existingMedicine = await this.medicineRepository.findBySlug(medicineSlug);
    if (existingMedicine) {
      throw new BadRequestException('Medicine with this name already exists');
    }

    if (dto.barcode) {
      const existingBarcode = await this.medicineRepository.findByBarcode(dto.barcode);
      if (existingBarcode) {
        throw new BadRequestException('Medicine with this barcode already exists');
      }
    }

    if (dto.costPrice && dto.costPrice > 0 && dto.price && dto.price > 0) {
      dto.profitMargin = ((dto.price! - dto.costPrice!) / dto.costPrice!) * 100;
    }

    const medicine = await this.medicineRepository.create({
      ...dto,
      slug: medicineSlug,
    } as any);

    await this.medicineRepository.logAudit({
      user: adminId,
      action: 'CREATE_MEDICINE',
      entity: 'Medicine',
      entityId: medicine._id.toString(),
      newValues: dto,
    });

    this.logger.log(`Medicine created: ${medicine.name}`);

    return {
      message: 'Medicine created successfully',
      data: medicine,
    };
  }

  async findAll(query: MedicineQueryDto) {
    const filter: any = { deletedAt: null };

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    if (query.category) {
      filter.category = query.category;
    }

    if (query.brand) {
      filter.brand = query.brand;
    }

    if (query.dosageForm) {
      filter.dosageForm = query.dosageForm;
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.price = {};
      if (query.minPrice !== undefined) filter.price.$gte = query.minPrice;
      if (query.maxPrice !== undefined) filter.price.$lte = query.maxPrice;
    }

    if (query.isPrescriptionRequired !== undefined) {
      filter.isPrescriptionRequired = query.isPrescriptionRequired;
    }

    if (query.isActive !== undefined) {
      filter.isActive = query.isActive;
    }

    if (query.isFeatured !== undefined) {
      filter.isFeatured = query.isFeatured;
    }

    if (query.inStock) {
      filter.stockQuantity = { $gt: 0 };
    }

    if (query.tags && query.tags.length > 0) {
      filter.tags = { $in: query.tags };
    }

    const sort: any = {};
    if (query.sortBy) {
      sort[query.sortBy] = query.sortOrder === 'asc' ? 1 : -1;
    } else {
      sort.createdAt = -1;
    }

    const result = await this.medicineRepository.paginate(filter, {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      sort,
    });

    return {
      message: 'Medicines retrieved successfully',
      data: result.data,
      meta: result.meta,
    };
  }

  async findById(id: string) {
    const medicine = await this.medicineRepository.findById(id);
    if (!medicine || medicine.deletedAt) {
      throw new NotFoundException('Medicine not found');
    }

    return {
      message: 'Medicine retrieved successfully',
      data: medicine,
    };
  }

  async findBySlug(slugValue: string) {
    const medicine = await this.medicineRepository.findBySlug(slugValue);
    if (!medicine || medicine.deletedAt) {
      throw new NotFoundException('Medicine not found');
    }

    return {
      message: 'Medicine retrieved successfully',
      data: medicine,
    };
  }

  async findByBarcode(barcode: string) {
    const medicine = await this.medicineRepository.findByBarcode(barcode);
    if (!medicine || medicine.deletedAt) {
      throw new NotFoundException('Medicine not found');
    }

    return {
      message: 'Medicine retrieved successfully',
      data: medicine,
    };
  }

  async update(id: string, dto: UpdateMedicineDto, adminId: string) {
    const medicine = await this.medicineRepository.findById(id);
    if (!medicine || medicine.deletedAt) {
      throw new NotFoundException('Medicine not found');
    }

    if (dto.name) {
      (dto as any).slug = slugify(dto.name);
    }

    if (dto.costPrice && dto.price) {
      dto.profitMargin = ((dto.price - dto.costPrice) / dto.costPrice) * 100;
    }

    const updatedMedicine = await this.medicineRepository.update(id, dto as any);

    await this.medicineRepository.logAudit({
      user: adminId,
      action: 'UPDATE_MEDICINE',
      entity: 'Medicine',
      entityId: id,
      oldValues: medicine.toObject(),
      newValues: dto,
    });

    this.logger.log(`Medicine ${id} updated by admin ${adminId}`);

    return {
      message: 'Medicine updated successfully',
      data: updatedMedicine,
    };
  }

  async updateStock(id: string, dto: UpdateStockDto, adminId: string) {
    const medicine = await this.medicineRepository.findById(id);
    if (!medicine || medicine.deletedAt) {
      throw new NotFoundException('Medicine not found');
    }

    let newStock: number;
    if (dto.operation === 'add') {
      newStock = medicine.stockQuantity + dto.quantity;
    } else if (dto.operation === 'subtract') {
      newStock = medicine.stockQuantity - dto.quantity;
      if (newStock < 0) {
        throw new BadRequestException('Insufficient stock');
      }
    } else {
      newStock = dto.quantity;
    }

    const updatedMedicine = await this.medicineRepository.update(id, {
      stockQuantity: newStock,
    });

    await this.medicineRepository.logAudit({
      user: adminId,
      action: 'UPDATE_STOCK',
      entity: 'Medicine',
      entityId: id,
      oldValues: { stockQuantity: medicine.stockQuantity },
      newValues: { stockQuantity: newStock, operation: dto.operation, quantity: dto.quantity },
    });

    this.logger.log(`Stock updated for medicine ${id}: ${medicine.stockQuantity} -> ${newStock}`);

    return {
      message: 'Stock updated successfully',
      data: updatedMedicine,
    };
  }

  async remove(id: string, adminId: string) {
    const medicine = await this.medicineRepository.findById(id);
    if (!medicine || medicine.deletedAt) {
      throw new NotFoundException('Medicine not found');
    }

    await this.medicineRepository.softDelete(id);

    await this.medicineRepository.logAudit({
      user: adminId,
      action: 'DELETE_MEDICINE',
      entity: 'Medicine',
      entityId: id,
      oldValues: { deletedAt: null },
      newValues: { deletedAt: new Date() },
    });

    this.logger.log(`Medicine ${id} soft deleted by admin ${adminId}`);

    return { message: 'Medicine deleted successfully' };
  }

  async getLowStockMedicines() {
    const medicines = await this.medicineRepository.findLowStock();

    return {
      message: 'Low stock medicines retrieved',
      data: medicines,
    };
  }

  async getExpiringMedicines(days: number = 30) {
    const medicines = await this.medicineRepository.findExpiring(days);

    return {
      message: 'Expiring medicines retrieved',
      data: medicines,
    };
  }

  async getFeaturedMedicines() {
    const medicines = await this.medicineRepository.findFeatured();

    return {
      message: 'Featured medicines retrieved',
      data: medicines,
    };
  }
}
