import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    if (statusCode >= 500) {
      const stack =
        exception instanceof Error ? exception.stack : undefined;
      this.logger.error(
        `${request.method} ${request.url} — ${statusCode}`,
        stack,
      );
    }

    response.status(statusCode).json({
      statusCode,
      code: this.deriveErrorCode(exception),
      message,
      requestId: request.headers['x-request-id'] ?? 'unknown',
      timestamp: new Date().toISOString(),
    });
  }

  private deriveErrorCode(exception: unknown): string {
    if (exception instanceof HttpException) {
      return `HTTP_${exception.getStatus()}`;
    }
    return 'INTERNAL_ERROR';
  }
}
