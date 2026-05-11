import { SetMetadata } from "@nestjs/common";

const THROTTLER_LIMIT_KEY = "THROTTLER:LIMIT";
const THROTTLER_TTL_KEY = "THROTTLER:TTL";
const THROTTLER_SKIP_KEY = "THROTTLER:SKIP";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ThrottlerDecorator = (target: any, propertyKey?: any, descriptor?: any) => any;

export function RateLimit(options: { limit: number; ttlSeconds: number }): ThrottlerDecorator {
	const limit = options.limit;
	const ttl = options.ttlSeconds * 1000;

	return (target, propertyKey, descriptor) => {
		SetMetadata(THROTTLER_LIMIT_KEY + "default", limit)(target, propertyKey, descriptor);
		SetMetadata(THROTTLER_TTL_KEY + "default", ttl)(target, propertyKey, descriptor);

		return descriptor ?? target;
	};
}

export function SkipRateLimit(): ThrottlerDecorator {
	return (target, propertyKey, descriptor) => {
		SetMetadata(THROTTLER_SKIP_KEY + "default", true)(target, propertyKey, descriptor);

		return descriptor ?? target;
	};
}
