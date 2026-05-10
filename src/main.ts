import "reflect-metadata";

import { NestFactory, Reflector } from "@nestjs/core";
import { ClassSerializerInterceptor, VersioningType } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ClsService } from "nestjs-cls";

import { AppModule } from "./app.module";
import { APP_CONFIG_KEY, type AppConfig } from "./core/config";
import { AllExceptionsFilter } from "./shared/filters";
import { CustomValidationPipe } from "./shared/pipes";
import { LoggingInterceptor, TransformInterceptor, TimeoutInterceptor } from "./shared/interceptors";

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
	application.use(cookieParser());

	application.useGlobalPipes(new CustomValidationPipe());

	const clsService = application.get(ClsService);
	application.useGlobalFilters(new AllExceptionsFilter(clsService));

	application.useGlobalInterceptors(
		new LoggingInterceptor(),
		new TransformInterceptor(clsService),
		new TimeoutInterceptor(),
		new ClassSerializerInterceptor(application.get(Reflector), { excludeExtraneousValues: true }),
	);

	const { DocumentBuilder, SwaggerModule } = await import("@nestjs/swagger");
	const documentConfiguration = new DocumentBuilder().setTitle("Ventairy Public API").setVersion("1.0").build();
	const document = SwaggerModule.createDocument(application, documentConfiguration);

	SwaggerModule.setup("docs", application, document, {
		jsonDocumentUrl: "/openapi.json",
		yamlDocumentUrl: "/openapi.yaml",
	});
	await application.listen(appConfiguration.port, "0.0.0.0");
}

bootstrap();
