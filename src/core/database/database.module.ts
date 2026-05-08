import { Module } from "@nestjs/common";
import { DrizzleService } from "./drizzle.service";
import { DRIZZLE_DB } from "./drizzle-db.provider";

@Module({
	providers: [
		DrizzleService,
		{
			provide: DRIZZLE_DB,
			useFactory: (drizzleService: DrizzleService) => drizzleService.db,
			inject: [DrizzleService],
		},
	],
	exports: [DrizzleService, DRIZZLE_DB],
})
export class DatabaseModule {}
