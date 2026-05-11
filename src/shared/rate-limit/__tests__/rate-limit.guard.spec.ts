import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
	ThrottlerGuard,
	type ThrottlerModuleOptions,
	type ThrottlerStorage,
} from "@nestjs/throttler";
import { RateLimitGuard } from "../rate-limit.guard";
import { RateLimitException } from "@shared/exceptions/rate-limit.exception";

describe("RateLimitGuard", () => {
	let guard: RateLimitGuard;
	let mockOptions: ThrottlerModuleOptions;
	let mockStorage: ThrottlerStorage;
	let mockReflector: Reflector;

	beforeEach(() => {
		mockOptions = [{ name: "default", ttl: 60_000, limit: 20 }];
		mockStorage = {
			increment: vi.fn().mockResolvedValue({
				totalHits: 1,
				timeToExpire: 60,
				isBlocked: false,
				timeToBlockExpire: 0,
			}),
		} as unknown as ThrottlerStorage;
		mockReflector = new Reflector();
		guard = new RateLimitGuard(mockOptions, mockStorage, mockReflector);
	});

	describe("getTracker", () => {
		it("should return user: prefixed tracker when user is authenticated", async () => {
			const req = { user: { id: "user-123" } };
			const tracker = await (guard as any).getTracker(req);
			expect(tracker).toBe("user:user-123");
		});

		it("should return ip: prefixed tracker when no user is present", async () => {
			const req = {
				headers: { "cf-connecting-ip": "1.2.3.4" },
			};
			const tracker = await (guard as any).getTracker(req);
			expect(tracker).toBe("ip:1.2.3.4");
		});

		it("should return ip: prefixed tracker when user has no id", async () => {
			const req = {
				user: { sessionId: "sess-1", userType: "BUSINESS" },
				headers: { "cf-connecting-ip": "5.6.7.8" },
			};
			const tracker = await (guard as any).getTracker(req);
			expect(tracker).toBe("ip:5.6.7.8");
		});
	});

	describe("throwThrottlingException", () => {
		it("should throw RateLimitException", async () => {
			const mockContext = {} as ExecutionContext;
			const mockDetail = {} as any;

			await expect(
				(guard as any).throwThrottlingException(mockContext, mockDetail),
			).rejects.toThrow(RateLimitException);
		});
	});

	describe("extends ThrottlerGuard", () => {
		it("should extend ThrottlerGuard", () => {
			expect(guard).toBeInstanceOf(ThrottlerGuard);
		});
	});
});
