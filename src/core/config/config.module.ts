import { Global, Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";

import { appConfig } from "./app.config";
import { databaseConfig } from "./database.config";
import { siweConfig } from "./siwe.config";

import { validationSchema } from "./validation.schema";

@Global()
@Module({
	imports: [
		NestConfigModule.forRoot({
			isGlobal: true,
			envFilePath: ".env",
			ignoreEnvFile: process.env["NODE_ENV"] === "test",
			load: [appConfig, databaseConfig, siweConfig],
			validationSchema: process.env["NODE_ENV"] === "test" ? undefined : validationSchema,
			validationOptions: {
				abortEarly: true,
				allowUnknown: true,
			},
		}),
	],
})
export class ConfigModule {}
