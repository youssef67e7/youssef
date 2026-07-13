import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/role.enum';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  @ApiOperation({ summary: 'Get sales report' })
  async getSalesReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getSalesReport(new Date(startDate), new Date(endDate));
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue report' })
  async getRevenueReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getRevenueReport(new Date(startDate), new Date(endDate));
  }

  @Get('inventory')
  @ApiOperation({ summary: 'Get inventory report' })
  async getInventoryReport() {
    return this.reportsService.getInventoryReport();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get user report' })
  async getUserReport() {
    return this.reportsService.getUserReport();
  }

  @Get('export/sales')
  @ApiOperation({ summary: 'Export sales report as CSV' })
  async exportSalesCSV(
    @Res() res: Response,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const report = await this.reportsService.getSalesReport(new Date(startDate), new Date(endDate));
    const csv = await this.reportsService.exportCSV(report.data.orders);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=sales-report-${startDate}-${endDate}.csv`);
    res.send(csv);
  }
}
