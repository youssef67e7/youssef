import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly userRepository: UserRepository) {}

  async findAll(query: UserQueryDto) {
    const filter: any = { deletedAt: null };

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
        { phone: { $regex: query.search, $options: 'i' } },
      ];
    }

    if (query.role) {
      filter.role = query.role;
    }

    if (query.isActive !== undefined) {
      filter.isActive = query.isActive;
    }

    if (query.isVerified !== undefined) {
      filter.isVerified = query.isVerified;
    }

    const result = await this.userRepository.paginate(filter, {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      sort: { [query.sortBy as string]: query.sortOrder === 'asc' ? 1 : -1 },
    });

    return {
      message: 'Users retrieved successfully',
      data: result.data,
      meta: result.meta,
    };
  }

  async findById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'User retrieved successfully',
      data: user,
    };
  }

  async update(id: string, dto: UpdateUserDto, adminId: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 12);
    }

    const updatedUser = await this.userRepository.update(id, dto);

    await this.userRepository.logAudit({
      user: adminId,
      action: 'UPDATE_USER',
      entity: 'User',
      entityId: id,
      oldValues: user.toObject(),
      newValues: dto,
    });

    this.logger.log(`User ${id} updated by admin ${adminId}`);

    return {
      message: 'User updated successfully',
      data: updatedUser,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.userRepository.update(userId, dto as any);

    return {
      message: 'Profile updated successfully',
      data: updatedUser,
    };
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.userRepository.update(userId, { avatar: avatarUrl });

    return {
      message: 'Avatar updated successfully',
      data: updatedUser,
    };
  }

  async softDelete(id: string, adminId: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'SUPER_ADMIN') {
      throw new ForbiddenException('Cannot delete super admin');
    }

    await this.userRepository.softDelete(id);

    await this.userRepository.logAudit({
      user: adminId,
      action: 'DELETE_USER',
      entity: 'User',
      entityId: id,
      oldValues: { deletedAt: null },
      newValues: { deletedAt: new Date() },
    });

    this.logger.log(`User ${id} soft deleted by admin ${adminId}`);

    return { message: 'User deleted successfully' };
  }

  async getMe(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'Profile retrieved successfully',
      data: user,
    };
  }
}
