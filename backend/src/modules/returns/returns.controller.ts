import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ReturnsService } from './returns.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/role.enum';

@ApiTags('Returns')
@Controller('returns')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Post('return-request')
  @ApiOperation({ summary: 'Create return request' })
  async createReturn(
    @CurrentUser('sub') userId: string,
    @Body('orderId') orderId: string,
    @Body('items') items: any[],
    @Body('reason') reason: string,
  ) {
    return this.returnsService.createReturnRequest(userId, orderId, items, reason);
  }

  @Get('my-returns')
  @ApiOperation({ summary: 'Get my return requests' })
  async getMyReturns(
    @CurrentUser('sub') userId: string,
    @Query() query: PaginationDto,
  ) {
    return this.returnsService.getMyReturns(userId, query);
  }

  @Get('admin/returns')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all return requests (admin)' })
  async getAllReturns(@Query() query: PaginationDto) {
    return this.returnsService.getAllReturns(query);
  }

  @Patch('admin/returns/:id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update return status (admin)' })
  @ApiParam({ name: 'id' })
  async updateReturnStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('adminNotes') adminNotes?: string,
  ) {
    return this.returnsService.updateReturnStatus(id, status, adminNotes);
  }

  @Post('exchange-request')
  @ApiOperation({ summary: 'Create exchange request' })
  async createExchange(
    @CurrentUser('sub') userId: string,
    @Body('orderId') orderId: string,
    @Body('originalItems') originalItems: any[],
    @Body('replacementItems') replacementItems: any[],
    @Body('reason') reason: string,
  ) {
    return this.returnsService.createExchangeRequest(userId, orderId, originalItems, replacementItems, reason);
  }

  @Get('my-exchanges')
  @ApiOperation({ summary: 'Get my exchange requests' })
  async getMyExchanges(
    @CurrentUser('sub') userId: string,
    @Query() query: PaginationDto,
  ) {
    return this.returnsService.getMyExchanges(userId, query);
  }

  @Patch('admin/exchanges/:id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update exchange status (admin)' })
  @ApiParam({ name: 'id' })
  async updateExchangeStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('adminNotes') adminNotes?: string,
  ) {
    return this.returnsService.updateExchangeStatus(id, status, adminNotes);
  }

  @Post('refund')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Process refund (admin)' })
  async processRefund(
    @CurrentUser('sub') adminId: string,
    @Body('orderId') orderId: string,
    @Body('userId') userId: string,
    @Body('amount') amount: number,
    @Body('reason') reason: string,
    @Body('refundMethod') refundMethod: string,
  ) {
    return this.returnsService.processRefund(orderId, userId, amount, reason, refundMethod);
  }

  @Get('admin/refunds')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all refunds (admin)' })
  async getAllRefunds(@Query() query: PaginationDto) {
    return this.returnsService.getAllRefunds(query);
  }

  @Patch('admin/refunds/:id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update refund status (admin)' })
  @ApiParam({ name: 'id' })
  async updateRefundStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @CurrentUser('sub') adminId: string,
  ) {
    return this.returnsService.updateRefundStatus(id, status, adminId);
  }
}
