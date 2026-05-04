import { Module } from "@nestjs/common";
import { LoggerModule as PinoLoggerModule } from "nestjs-pino";
import { ClsModule } from "nestjs-cls";
import { ConfigService } from "@nestjs/config";

import { type AppConfig, APP_CONFIG_KEY } from "../config";

@Module({
	imports: [
		ClsModule.forRoot({
			global: true,
			middleware: {
				mount: true,
				generateId: true,
				idGenerator: (request: Request & { headers: Record<string, string | string[] | undefined> }) =>
					request.headers["x-request-id"]?.toString() ??
					crypto.randomUUID(),
			},
		}),
		PinoLoggerModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				const config = configService.get<AppConfig>(APP_CONFIG_KEY);
				if (!config) throw new Error("Application configuration is missing");
				return {
					pinoHttp: {
						level: config.nodeEnv === "production" ? "info" : "debug",
						transport:
							config.nodeEnv !== "production"
								? { target: "pino-pretty" }
								: undefined,
						redact: {
							paths: [
								"req.headers.authorization",
								"req.headers[\"x-api-key\"]",
								"req.body.password",
								"req.body.cpf",
								"req.body.pixKey",
								"req.body.cardNumber",
								"req.body.secret",
								"req.body.token",
								"req.body.key",
							],
							censor: "[REDACTED]",
						},
						serializers: {
							req: (request: { method: string; url: string; query: unknown }) => ({
								method: request.method,
								url: request.url,
								query: request.query,
							}),
							res: (response: { statusCode: number }) => ({
								statusCode: response.statusCode,
							}),
						},
					},
				};
			},
		}),
	],
})
export class LoggerModule {}