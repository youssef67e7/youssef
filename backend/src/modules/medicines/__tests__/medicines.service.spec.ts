jest.mock('slug', () => {
  return jest.fn().mockImplementation((text: string, opts: any) => {
    return text.toLowerCase().replace(/\s+/g, '-');
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { MedicinesService } from '../medicines.service';
import { MedicineRepository } from '../repositories/medicine.repository';

describe('MedicinesService', () => {
  let service: MedicinesService;
  let repository: any;

  const mockMedicine = {
    _id: 'med123',
    name: 'Paracetamol 500mg',
    slug: 'paracetamol-500mg',
    sku: 'PARA500',
    price: 25,
    stockQuantity: 100,
    isActive: true,
    deletedAt: null,
    toObject: jest.fn().mockReturnValue({ _id: 'med123', name: 'Paracetamol 500mg' }),
  };

  const mockRepository = {
    findBySlug: jest.fn(),
    findByBarcode: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    paginate: jest.fn(),
    logAudit: jest.fn(),
    findLowStock: jest.fn(),
    findExpiring: jest.fn(),
    findFeatured: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicinesService,
        { provide: MedicineRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<MedicinesService>(MedicinesService);
    repository = module.get<MedicineRepository>(MedicineRepository);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto = { name: 'Paracetamol 500mg', sku: 'PARA500', price: 25, stockQuantity: 100, category: 'cat1', dosageForm: 'TABLET', strength: '500mg' };

    it('should create a new medicine', async () => {
      repository.findBySlug.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockMedicine);

      const result = await service.create(dto as any, 'admin123');

      expect(result.message).toBe('Medicine created successfully');
      expect(result.data).toBeDefined();
      expect(repository.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException for duplicate slug', async () => {
      repository.findBySlug.mockResolvedValue(mockMedicine);

      await expect(service.create(dto as any, 'admin123')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for duplicate barcode', async () => {
      repository.findBySlug.mockResolvedValue(null);
      repository.findByBarcode.mockResolvedValue(mockMedicine);

      await expect(
        service.create({ ...dto, barcode: 'BAR123' } as any, 'admin123'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated medicines', async () => {
      repository.paginate.mockResolvedValue({
        data: [mockMedicine],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1, hasNextPage: false, hasPrevPage: false },
      });

      const result = await service.findAll({ page: 1, limit: 20 } as any);

      expect(result.data).toBeDefined();
      expect(result.meta).toBeDefined();
      expect(repository.paginate).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a medicine by id', async () => {
      repository.findById.mockResolvedValue(mockMedicine);

      const result = await service.findById('med123');

      expect(result.message).toBe('Medicine retrieved successfully');
      expect(result.data).toBeDefined();
    });

    it('should throw NotFoundException for non-existent medicine', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a medicine', async () => {
      repository.findById.mockResolvedValue(mockMedicine);
      repository.update.mockResolvedValue({ ...mockMedicine, price: 20 });

      const result = await service.update('med123', { price: 20 } as any, 'admin123');

      expect(result.message).toBe('Medicine updated successfully');
      expect(repository.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent medicine', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update('nonexistent', { price: 20 } as any, 'admin123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStock', () => {
    it('should add stock', async () => {
      repository.findById.mockResolvedValue({ ...mockMedicine, stockQuantity: 100 });
      repository.update.mockResolvedValue({ ...mockMedicine, stockQuantity: 110 });

      const result = await service.updateStock('med123', { operation: 'add', quantity: 10 } as any, 'admin123');

      expect(result.message).toBe('Stock updated successfully');
    });

    it('should throw NotFoundException for non-existent medicine', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.updateStock('nonexistent', { operation: 'add', quantity: 10 } as any, 'admin123')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for insufficient stock', async () => {
      repository.findById.mockResolvedValue({ ...mockMedicine, stockQuantity: 5 });

      await expect(service.updateStock('med123', { operation: 'subtract', quantity: 10 } as any, 'admin123')).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should soft delete a medicine', async () => {
      repository.findById.mockResolvedValue(mockMedicine);
      repository.softDelete.mockResolvedValue(undefined);

      const result = await service.remove('med123', 'admin123');

      expect(result.message).toBe('Medicine deleted successfully');
      expect(repository.softDelete).toHaveBeenCalledWith('med123');
    });

    it('should throw NotFoundException for non-existent medicine', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.remove('nonexistent', 'admin123')).rejects.toThrow(NotFoundException);
    });
  });
});
