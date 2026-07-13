import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/role.enum';

@ApiTags('Banners')
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a banner' })
  async create(
    @Body() dto: CreateBannerDto,
    @CurrentUser('sub') adminId: string,
  ) {
    return this.bannersService.create(dto, adminId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all banners' })
  async findAll(@Query() query: PaginationDto) {
    return this.bannersService.findAll(query);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active banners' })
  async findActive() {
    return this.bannersService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get banner by ID' })
  @ApiParam({ name: 'id' })
  async findById(@Param('id') id: string) {
    return this.bannersService.findById(id);
  }

  @Post(':id/impression')
  @ApiOperation({ summary: 'Track banner impression' })
  @ApiParam({ name: 'id' })
  async trackImpression(@Param('id') id: string) {
    return this.bannersService.trackImpression(id);
  }

  @Post(':id/click')
  @ApiOperation({ summary: 'Track banner click' })
  @ApiParam({ name: 'id' })
  async trackClick(@Param('id') id: string) {
    return this.bannersService.trackClick(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update banner' })
  @ApiParam({ name: 'id' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBannerDto,
    @CurrentUser('sub') adminId: string,
  ) {
    return this.bannersService.update(id, dto, adminId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete banner' })
  @ApiParam({ name: 'id' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('sub') adminId: string,
  ) {
    return this.bannersService.remove(id, adminId);
  }
}
