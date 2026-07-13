import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
  ) {}

  async check() {
    const checks = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: await this.checkDatabase(),
        memory: this.checkMemory(),
        disk: this.checkDisk(),
      },
    };

    const allHealthy = Object.values(checks.services).every(
      (s: any) => s.status === 'ok',
    );

    checks.status = allHealthy ? 'ok' : 'degraded';

    return checks;
  }

  private async checkDatabase() {
    try {
      const state = this.mongoConnection.readyState;
      const stateMap: Record<number, string> = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
      };

      if (state === 1) {
        await (this.mongoConnection as any).db.admin().ping();
        return {
          status: 'ok',
          message: 'MongoDB is connected and responding',
          state: stateMap[state] || 'unknown',
        };
      }

      return {
        status: 'error',
        message: `MongoDB is ${stateMap[state] || 'unknown'}`,
        state: stateMap[state] || 'unknown',
      };
    } catch (error) {
      return {
        status: 'error',
        message: `MongoDB error: ${error.message}`,
      };
    }
  }

  private checkMemory() {
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const rssUsedMB = Math.round(memUsage.rss / 1024 / 1024);

    return {
      status: heapUsedMB < 500 ? 'ok' : 'warning',
      heapUsed: `${heapUsedMB}MB`,
      heapTotal: `${heapTotalMB}MB`,
      rss: `${rssUsedMB}MB`,
    };
  }

  private checkDisk() {
    return {
      status: 'ok',
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
    };
  }
}
