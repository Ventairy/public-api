import { Injectable, NestInterceptor, ExecutionContext, CallHandler, RequestTimeoutException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Observable, TimeoutError } from "rxjs";
import { catchError, timeout } from "rxjs/operators";
import { APP_CONFIG_KEY, type AppConfig } from "@core/config";

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
	private readonly _timeoutMs: number;

	constructor(configService: ConfigService) {
		const appConfig = configService.getOrThrow<AppConfig>(APP_CONFIG_KEY);
		this._timeoutMs = appConfig.requestTimeoutMs;
	}

	intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
		return next.handle().pipe(
			timeout(this._timeoutMs),
			catchError((error: unknown) => {
				if (error instanceof TimeoutError) throw new RequestTimeoutException("Request timed out");

				throw error;
			}),
		);
	}
}
