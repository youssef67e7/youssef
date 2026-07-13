import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Addresses')
@Controller('addresses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @ApiOperation({ summary: 'Create address' })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateAddressDto,
  ) {
    return this.addressService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all addresses' })
  async findAll(@CurrentUser('sub') userId: string) {
    return this.addressService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get address by ID' })
  @ApiParam({ name: 'id' })
  async findById(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.addressService.findById(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update address' })
  @ApiParam({ name: 'id' })
  async update(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressService.update(id, userId, dto);
  }

  @Patch(':id/default')
  @ApiOperation({ summary: 'Set as default address' })
  @ApiParam({ name: 'id' })
  async setDefault(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.addressService.setDefault(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete address' })
  @ApiParam({ name: 'id' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.addressService.remove(id, userId);
  }
}
