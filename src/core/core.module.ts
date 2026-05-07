import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "./config";
import { LoggerModule } from "./logger";
import { DatabaseModule } from "./database";
import { HttpModule } from "./http";
import { HealthModule } from "../modules/health";
import { SchedulerModule } from "./scheduler";
import { ObservabilityModule } from "./observability";
import { StorageModule } from "./storage";

@Global()
@Module({
	imports: [ConfigModule, LoggerModule, DatabaseModule, HttpModule, HealthModule, SchedulerModule, ObservabilityModule, StorageModule],
	exports: [ConfigModule, LoggerModule, DatabaseModule, HttpModule, HealthModule, SchedulerModule, ObservabilityModule, StorageModule],
})
export class CoreModule {}
