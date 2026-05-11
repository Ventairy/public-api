import { Controller, Get } from "@nestjs/common";
import { HealthCheckService, HealthCheck, type HealthCheckResult } from "@nestjs/terminus";
import { Public } from "@shared/decorators/public.decorator";
import { RateLimit } from "@shared/rate-limit/rate-limit.decorator";

@Controller("health")
export class HealthController {
	constructor(private readonly health: HealthCheckService) {}

	@Get("live")
	@HealthCheck()
	@Public()
	@RateLimit({ limit: 10, ttlSeconds: 60 })
	liveness(): Promise<HealthCheckResult> {
		return this.health.check([]);
	}

	@Get("ready")
	@HealthCheck()
	@Public()
	@RateLimit({ limit: 5, ttlSeconds: 60 })
	readiness(): Promise<HealthCheckResult> {
		return this.health.check([]);
	}
}
