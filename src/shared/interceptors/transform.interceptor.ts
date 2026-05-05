import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject } from "@nestjs/common";
import { Observable, map } from "rxjs";
import { ClsService } from "nestjs-cls";

export interface ResponseEnvelope<T> {
	data: T;
	meta: {
		timestamp: string;
		requestId: string;
	};
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ResponseEnvelope<T>> {
	constructor(@Inject(ClsService) private readonly clsService: ClsService) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseEnvelope<T>> {
		const requestId = this.clsService.getId() ?? "unknown";

		return next.handle().pipe(
			map((data) => ({
				data,
				meta: {
					timestamp: new Date().toISOString(),
					requestId,
				},
			})),
		);
	}
}
