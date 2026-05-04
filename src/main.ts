import "reflect-metadata";

import { NestFactory } from "@nestjs/core";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ClsService } from "nestjs-cls";

import { AppModule } from "./app.module";
import { APP_CONFIG_KEY, type AppConfig } from "./core/config";
import { CorsMiddleware } from "./shared/middlewares/cors.middleware";
import { AllExceptionsFilter } from "./shared/filters";
import { LoggingInterceptor, TransformInterceptor, TimeoutInterceptor, AuditInterceptor } from "./shared/interceptors";

async function bootstrap(): Promise<void> {
	const application = await NestFactory.create<NestExpressApplication>(AppModule, {
		bufferLogs: true,
	});

	const configService = application.get(ConfigService);
	const appConfiguration = configService.get<AppConfig>(APP_CONFIG_KEY);
	if (!appConfiguration) {
		throw new Error("Application configuration is missing");
	}

	application.enableShutdownHooks();

	application.enableVersioning({
		type: VersioningType.URI,
		defaultVersion: "1",
	});

	application.use(helmet());

	const corsMiddleware = application.get(CorsMiddleware);
	application.use(corsMiddleware.use.bind(corsMiddleware));

	application.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
			transformOptions: {
				enableImplicitConversion: true,
			},
		}),
	);

	application.useGlobalFilters(new AllExceptionsFilter());

	const clsService = application.get(ClsService);
	application.useGlobalInterceptors(
		new LoggingInterceptor(),
		new TransformInterceptor(),
		new TimeoutInterceptor(),
		new AuditInterceptor(clsService),
	);

	if (appConfiguration.swaggerEnabled) {
		const { DocumentBuilder, SwaggerModule } = await import("@nestjs/swagger");
		const documentConfiguration = new DocumentBuilder()
			.setTitle("Ventairy API")
			.setDescription("Cross-border payment orchestration — fiat in, stablecoins out")
			.setVersion("1.0")
			.build();
		const document = SwaggerModule.createDocument(application, documentConfiguration);

		SwaggerModule.setup("docs", application, document, {
			jsonDocumentUrl: "/openapi.json",
			yamlDocumentUrl: "/openapi.yaml",
		});
	}
	await application.listen(appConfiguration.port, "0.0.0.0");
}

bootstrap();
