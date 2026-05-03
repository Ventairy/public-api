import { Global, Module } from '@nestjs/common';
import { ConfigModule } from './config';
import { LoggerModule } from './logger';
import { DatabaseModule } from './database';
import { HttpModule } from './http';
import { HealthModule } from './health';
import { SchedulerModule } from './scheduler';
import { ObservabilityModule } from './observability';

@Global()
@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    DatabaseModule,
    HttpModule,
    HealthModule,
    SchedulerModule,
    ObservabilityModule,
  ],
  exports: [
    ConfigModule,
    LoggerModule,
    DatabaseModule,
    HttpModule,
    HealthModule,
    SchedulerModule,
    ObservabilityModule,
  ],
})
export class CoreModule {}
