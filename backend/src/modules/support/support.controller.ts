import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { SupportService } from './support.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/role.enum';

@ApiTags('Support')
@Controller('support')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('tickets')
  @ApiOperation({ summary: 'Create support ticket' })
  async createTicket(
    @CurrentUser('sub') userId: string,
    @Body('subject') subject: string,
    @Body('message') message: string,
    @Body('category') category?: string,
  ) {
    return this.supportService.createTicket(userId, subject, message, category);
  }

  @Get('tickets')
  @ApiOperation({ summary: 'Get my tickets' })
  async getMyTickets(
    @CurrentUser('sub') userId: string,
    @Query() query: PaginationDto,
  ) {
    return this.supportService.getMyTickets(userId, query);
  }

  @Get('admin/tickets')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all tickets (admin)' })
  async getAllTickets(@Query() query: PaginationDto) {
    return this.supportService.getAllTickets(query);
  }

  @Get('tickets/:id')
  @ApiOperation({ summary: 'Get ticket by ID' })
  @ApiParam({ name: 'id' })
  async getTicket(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: string,
  ) {
    const userIdParam = ['SUPER_ADMIN', 'ADMIN'].includes(role) ? undefined : userId;
    return this.supportService.getTicketById(id, userIdParam);
  }

  @Post('tickets/:id/messages')
  @ApiOperation({ summary: 'Send message in ticket' })
  @ApiParam({ name: 'id' })
  async sendMessage(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: string,
    @Body('message') message: string,
  ) {
    return this.supportService.sendMessage(id, userId, message, ['SUPER_ADMIN', 'ADMIN'].includes(role));
  }

  @Patch('tickets/:id/assign')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Assign ticket to admin' })
  @ApiParam({ name: 'id' })
  async assignTicket(
    @Param('id') id: string,
    @CurrentUser('sub') adminId: string,
  ) {
    return this.supportService.assignTicket(id, adminId);
  }

  @Patch('tickets/:id/close')
  @ApiOperation({ summary: 'Close ticket' })
  @ApiParam({ name: 'id' })
  async closeTicket(@Param('id') id: string) {
    return this.supportService.closeTicket(id);
  }

  @Patch('tickets/:id/resolve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Resolve ticket' })
  @ApiParam({ name: 'id' })
  async resolveTicket(@Param('id') id: string) {
    return this.supportService.resolveTicket(id);
  }
}
