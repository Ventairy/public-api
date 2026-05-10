import { Module } from "@nestjs/common";
import { DrizzleService } from "./drizzle.service";
import { AtomicDatabaseExecutionService } from "./atomic-database-execution.service";
import { DRIZZLE_DB } from "./drizzle-db.provider";

@Module({
	providers: [
		DrizzleService,
		AtomicDatabaseExecutionService,
		{
			provide: DRIZZLE_DB,
			useFactory: (drizzleService: DrizzleService) => drizzleService.db,
			inject: [DrizzleService],
		},
	],
	exports: [DrizzleService, DRIZZLE_DB, AtomicDatabaseExecutionService],
})
export class DatabaseModule {}
