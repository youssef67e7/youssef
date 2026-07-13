import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Health check passed' })
  @ApiResponse({ status: 503, description: 'Service degraded' })
  async check() {
    return this.healthService.check();
  }

  @Get('ping')
  @ApiOperation({ summary: 'Simple ping check' })
  async ping() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
