import "reflect-metadata";
import { describe, it, expect } from "vitest";
import { RateLimit, SkipRateLimit } from "../rate-limit.decorator";

describe("RateLimit", () => {
	it("should set throttle metadata with default name", () => {
		class Target {
			method() {}
		}

		const descriptor = Object.getOwnPropertyDescriptor(Target.prototype, "method")!;
		RateLimit({ limit: 5, ttlSeconds: 60 })(Target.prototype, "method", descriptor);

		const limit = Reflect.getOwnMetadata("THROTTLER:LIMITdefault", Target.prototype.method);
		const ttl = Reflect.getOwnMetadata("THROTTLER:TTLdefault", Target.prototype.method);

		expect(limit).toBe(5);
		expect(ttl).toBe(60_000);
	});

	it("should convert ttlSeconds to milliseconds", () => {
		class Target {
			method() {}
		}

		const descriptor = Object.getOwnPropertyDescriptor(Target.prototype, "method")!;
		RateLimit({ limit: 3, ttlSeconds: 300 })(Target.prototype, "method", descriptor);

		expect(Reflect.getOwnMetadata("THROTTLER:TTLdefault", Target.prototype.method)).toBe(300_000);
	});
});

describe("SkipRateLimit", () => {
	it("should set skip throttle metadata with default name", () => {
		class Target {
			method() {}
		}

		const descriptor = Object.getOwnPropertyDescriptor(Target.prototype, "method")!;
		SkipRateLimit()(Target.prototype, "method", descriptor);

		expect(Reflect.getOwnMetadata("THROTTLER:SKIPdefault", Target.prototype.method)).toBe(true);
	});
});
