import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Address, AddressDocument } from '../../database/schemas/address.schema';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
  private readonly logger = new Logger(AddressService.name);

  constructor(
    @InjectModel(Address.name) private addressModel: Model<AddressDocument>,
  ) {}

  async create(userId: string, dto: CreateAddressDto) {
    if (dto.isDefault) {
      await this.addressModel.updateMany({ user: userId }, { $set: { isDefault: false } });
    }

    const address = await this.addressModel.create({
      ...dto,
      user: userId,
    });

    this.logger.log(`Address created for user ${userId}`);

    return {
      message: 'Address created successfully',
      data: address,
    };
  }

  async findAll(userId: string) {
    const addresses = await this.addressModel.find({ user: userId, isDeleted: false })
      .sort({ isDefault: -1, createdAt: -1 });

    return {
      message: 'Addresses retrieved',
      data: addresses,
    };
  }

  async findById(id: string, userId: string) {
    const address = await this.addressModel.findOne({ _id: id, user: userId, isDeleted: false });
    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return {
      message: 'Address retrieved',
      data: address,
    };
  }

  async update(id: string, userId: string, dto: UpdateAddressDto) {
    const address = await this.addressModel.findOne({ _id: id, user: userId, isDeleted: false });
    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (dto.isDefault) {
      await this.addressModel.updateMany({ user: userId }, { $set: { isDefault: false } });
    }

    const updated = await this.addressModel.findByIdAndUpdate(id, { $set: dto }, { new: true });

    return {
      message: 'Address updated successfully',
      data: updated,
    };
  }

  async setDefault(id: string, userId: string) {
    const address = await this.addressModel.findOne({ _id: id, user: userId, isDeleted: false });
    if (!address) {
      throw new NotFoundException('Address not found');
    }

    await this.addressModel.updateMany({ user: userId }, { $set: { isDefault: false } });
    await this.addressModel.findByIdAndUpdate(id, { $set: { isDefault: true } });

    return { message: 'Default address set' };
  }

  async remove(id: string, userId: string) {
    const address = await this.addressModel.findOne({ _id: id, user: userId, isDeleted: false });
    if (!address) {
      throw new NotFoundException('Address not found');
    }

    await this.addressModel.findByIdAndUpdate(id, { $set: { isDeleted: true } });

    return { message: 'Address deleted successfully' };
  }
}
