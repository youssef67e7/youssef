import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { SystemSettingsService } from './system-settings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/role.enum';

@ApiTags('System Settings')
@Controller('system-settings')
export class SystemSettingsController {
  constructor(private readonly systemSettingsService: SystemSettingsService) {}

  @Get('public')
  @ApiOperation({ summary: 'Get public settings' })
  async findPublic() {
    return this.systemSettingsService.findPublic();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all settings (admin)' })
  async findAll() {
    return this.systemSettingsService.findAll();
  }

  @Get(':key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get setting by key' })
  @ApiParam({ name: 'key' })
  async findByKey(@Param('key') key: string) {
    return this.systemSettingsService.findByKey(key);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create/update setting' })
  async set(
    @Body('key') key: string,
    @Body('value') value: any,
    @Body('type') type?: string,
    @Body('description') description?: string,
    @Body('isPublic') isPublic?: boolean,
  ) {
    return this.systemSettingsService.set(key, value, type, description, isPublic);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk update settings' })
  async bulkUpdate(@Body('settings') settings: any[]) {
    return this.systemSettingsService.bulkUpdate(settings);
  }

  @Delete(':key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete setting' })
  @ApiParam({ name: 'key' })
  async remove(@Param('key') key: string) {
    return this.systemSettingsService.remove(key);
  }

  @Post('maintenance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle maintenance mode' })
  async toggleMaintenance(@Body('enable') enable: boolean) {
    return this.systemSettingsService.toggleMaintenanceMode(enable);
  }
}
