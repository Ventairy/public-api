import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from "@nestjs/common";
import { Observable, tap } from "rxjs";
import { ClsService } from "nestjs-cls";
import { Request } from "express";

@Injectable()
export class AuditInterceptor implements NestInterceptor {
	private readonly logger = new Logger("Audit");

	constructor(private readonly cls: ClsService) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		const request = context.switchToHttp().getRequest<Request>();
		const actorId =
			(this.cls.get("actorId") as string | undefined) ??
			(request as Request & { user?: { id?: string } }).user?.id ??
			"anonymous";
		const requestId = (this.cls.getId() as string) ?? "unknown";
		const action = `${request.method} ${request.url}`;

		return next.handle().pipe(
			tap(() => {
				this.logger.log(
					JSON.stringify({
						actorId,
						action,
						requestId,
						timestamp: new Date().toISOString(),
					}),
				);
			}),
		);
	}
}
