import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject, StreamableFile } from "@nestjs/common";
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
export class TransformInterceptor<T> implements NestInterceptor<T, ResponseEnvelope<T> | StreamableFile> {
	constructor(@Inject(ClsService) private readonly clsService: ClsService) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseEnvelope<T> | StreamableFile> {
		const requestId = this.clsService.getId() ?? "unknown";

		return next.handle().pipe(
			map((data) => {
				if (data instanceof StreamableFile) return data;

				return {
					data,
					meta: {
						timestamp: new Date().toISOString(),
						requestId,
					},
				};
			}),
		);
	}
}
