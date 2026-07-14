import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AiPrescriptionsService } from './ai-prescriptions.service';
import { CreateAnalysisDto } from './dto/create-analysis.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('ai-prescriptions')
export class AiPrescriptionsController {
  constructor(private readonly service: AiPrescriptionsService) {}

  @Post('analyze')
  @UseGuards(JwtAuthGuard)
  async analyze(@CurrentUser('sub') userId: string, @Body() dto: CreateAnalysisDto) {
    return this.service.analyze(userId, dto);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async history(@CurrentUser('sub') userId: string, @Query() query: any) {
    return this.service.getHistory(userId, query);
  }
}
