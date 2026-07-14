import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { TelemedicineService } from './telemedicine.service';
import { CreateDoctorDto, UpdateDoctorDto, UpdateAppointmentDto } from './dto/telemedicine.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/role.enum';

@Controller('telemedicine')
export class TelemedicineController {
  constructor(private readonly telemedicineService: TelemedicineService) {}

  @Get('doctors')
  getDoctors(@Query() query: any) { return this.telemedicineService.getDoctors(query); }

  @Get('doctors/:id')
  getDoctor(@Param('id') id: string) { return this.telemedicineService.getDoctor(id); }

  @Post('doctors')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  createDoctor(@Body() dto: CreateDoctorDto) { return this.telemedicineService.createDoctor(dto); }

  @Patch('doctors/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  updateDoctor(@Param('id') id: string, @Body() dto: UpdateDoctorDto) { return this.telemedicineService.updateDoctor(id, dto); }

  @Delete('doctors/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  deleteDoctor(@Param('id') id: string) { return this.telemedicineService.deleteDoctor(id); }

  @Get('appointments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PHARMACIST)
  getAppointments(@Query() query: any) { return this.telemedicineService.getAppointments(query); }

  @Patch('appointments/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  updateAppointment(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) { return this.telemedicineService.updateAppointment(id, dto); }
}
