import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MedicinesService } from './medicines.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { MedicineQueryDto } from './dto/medicine-query.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/role.enum';

@ApiTags('Medicines')
@Controller('medicines')
export class MedicinesController {
  constructor(private readonly medicinesService: MedicinesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PHARMACIST)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new medicine' })
  @ApiResponse({ status: 201, description: 'Medicine created' })
  async create(@Body() dto: CreateMedicineDto, @CurrentUser('sub') adminId: string) {
    return this.medicinesService.create(dto, adminId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all medicines with filters' })
  @ApiResponse({ status: 200, description: 'Medicines retrieved' })
  async findAll(@Query() query: MedicineQueryDto) {
    return this.medicinesService.findAll(query);
  }

  @Get('low-stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PHARMACIST)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get low stock medicines' })
  async getLowStock() {
    return this.medicinesService.getLowStockMedicines();
  }

  @Get('expiring')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PHARMACIST)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get expiring medicines' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getExpiring(@Query('days') days?: number) {
    return this.medicinesService.getExpiringMedicines(days);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured medicines' })
  async getFeatured() {
    return this.medicinesService.getFeaturedMedicines();
  }

  @Get('barcode/:barcode')
  @ApiOperation({ summary: 'Find medicine by barcode' })
  @ApiParam({ name: 'barcode' })
  async findByBarcode(@Param('barcode') barcode: string) {
    return this.medicinesService.findByBarcode(barcode);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get medicine by ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Medicine retrieved' })
  @ApiResponse({ status: 404, description: 'Medicine not found' })
  async findById(@Param('id') id: string) {
    return this.medicinesService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PHARMACIST)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update medicine' })
  @ApiParam({ name: 'id' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMedicineDto,
    @CurrentUser('sub') adminId: string,
  ) {
    return this.medicinesService.update(id, dto, adminId);
  }

  @Patch(':id/stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PHARMACIST)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update medicine stock' })
  @ApiParam({ name: 'id' })
  async updateStock(
    @Param('id') id: string,
    @Body() dto: UpdateStockDto,
    @CurrentUser('sub') adminId: string,
  ) {
    return this.medicinesService.updateStock(id, dto, adminId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete medicine (soft delete)' })
  @ApiParam({ name: 'id' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('sub') adminId: string,
  ) {
    return this.medicinesService.remove(id, adminId);
  }
}
