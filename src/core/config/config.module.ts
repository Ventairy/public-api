import { Global, Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";

import { appConfig } from "./app.config";
import { databaseConfig } from "./database.config";
import { providersConfig } from "./providers.config";

import { validationSchema } from "./validation.schema";

@Global()
@Module({
	imports: [
		NestConfigModule.forRoot({
			isGlobal: true,
			envFilePath: '.env',
			load: [appConfig, databaseConfig, providersConfig],
			validationSchema,
			validationOptions: {
				abortEarly: true,
				allowUnknown: true,
			},
		}),
	],
})
export class ConfigModule {}