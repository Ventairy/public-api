import { Injectable, type ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
	ThrottlerGuard,
	type ThrottlerModuleOptions,
	type ThrottlerStorage,
	type ThrottlerLimitDetail,
	InjectThrottlerOptions,
	InjectThrottlerStorage,
} from "@nestjs/throttler";
import type { Request } from "express";
import { RateLimitException } from "@shared/exceptions/rate-limit.exception";
import { IpUtils } from "./ip.utils";

@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
	constructor(
		@InjectThrottlerOptions() options: ThrottlerModuleOptions,
		@InjectThrottlerStorage() storageService: ThrottlerStorage,
		reflector: Reflector,
	) {
		super(options, storageService, reflector);
	}

	protected override async getTracker(req: Request): Promise<string> {
		const userId: string | undefined = req["user"]?.id;
		if (userId) return `user:${userId}`;

		return `ip:${IpUtils.extractClientIp(req)}`;
	}

	protected override async throwThrottlingException(
		_context: ExecutionContext,
		throttlerLimitDetail: ThrottlerLimitDetail,
	): Promise<void> {
		const retryAfterSeconds =
			"timeToBlockExpire" in throttlerLimitDetail ? Number(throttlerLimitDetail["timeToBlockExpire"]) : 60;
		throw new RateLimitException({ retryAfterSeconds });
	}
}
