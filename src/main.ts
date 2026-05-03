import 'reflect-metadata';

import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ClsService } from 'nestjs-cls';

import { AppModule } from './app.module';
import { type AppConfig, appConfig } from './core/config';
import { CorsMiddleware } from './shared/middlewares/cors.middleware';
import { AllExceptionsFilter } from './shared/filters';
import {
  LoggingInterceptor,
  TransformInterceptor,
  TimeoutInterceptor,
  AuditInterceptor,
} from './shared/interceptors';
import { ApiKeyGuard } from './shared/guards';

async function bootstrap(): Promise<void> {
  const application = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  const configService = application.get(ConfigService);
  const appConfiguration = configService.get<AppConfig>(appConfig.KEY);
  if (!appConfiguration) {
    throw new Error('Application configuration is missing');
  }

  application.enableShutdownHooks();

  application.setGlobalPrefix(appConfiguration.apiPrefix);

  application.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
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

  const reflector = application.get(Reflector);
  application.useGlobalGuards(new ApiKeyGuard(reflector, configService));

  application.useGlobalFilters(new AllExceptionsFilter());

  const clsService = application.get(ClsService);
  application.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
    new TimeoutInterceptor(),
    new AuditInterceptor(clsService),
  );

  if (appConfiguration.swaggerEnabled) {
    const { DocumentBuilder, SwaggerModule } = await import('@nestjs/swagger');
    const documentConfiguration = new DocumentBuilder()
      .setTitle('Ventairy API')
      .setDescription(
        'Cross-border payment orchestration — fiat in, stablecoins out',
      )
      .setVersion('1.0')
      .addApiKey(
        { type: 'apiKey', name: 'X-Api-Key', in: 'header' },
        'ApiKeyAuth',
      )
      .build();
    const document = SwaggerModule.createDocument(
      application,
      documentConfiguration,
    );
    SwaggerModule.setup('docs', application, document);
  }

  await application.listen(appConfiguration.port);
}

bootstrap();
