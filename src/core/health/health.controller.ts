import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  type HealthCheckResult,
} from '@nestjs/terminus';
import { Public } from '@shared/decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthCheckService) {}

  @Get('live')
  @HealthCheck()
  @Public()
  liveness(): Promise<HealthCheckResult> {
    return this.health.check([]);
  }

  @Get('ready')
  @HealthCheck()
  @Public()
  readiness(): Promise<HealthCheckResult> {
    return this.health.check([]);
  }
}
