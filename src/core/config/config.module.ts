import { Global, Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";

import { appConfig } from "./app.config";
import { databaseConfig } from "./database.config";
import { siweConfig } from "./siwe.config";
import { r2Config } from "./r2.config";
import { jwtConfig } from "./jwt.config";
import { blindpayConfig } from "./blindpay.config";

import { validationSchema } from "./validation.schema";

@Global()
@Module({
	imports: [
		NestConfigModule.forRoot({
			isGlobal: true,
			envFilePath: ".env",
			ignoreEnvFile: process.env["NODE_ENV"] === "test",
			load: [appConfig, databaseConfig, siweConfig, r2Config, jwtConfig, blindpayConfig],
			validationSchema: process.env["NODE_ENV"] === "test" ? undefined : validationSchema,
			validationOptions: {
				abortEarly: true,
				allowUnknown: true,
			},
		}),
	],
})
export class ConfigModule {}
