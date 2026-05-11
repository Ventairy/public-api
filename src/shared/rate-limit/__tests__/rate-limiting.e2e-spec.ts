import { describe, it, expect, vi, beforeEach } from "vitest";
import { Reflector } from "@nestjs/core";
import type { ExecutionContext } from "@nestjs/common";
import { type ThrottlerModuleOptions, type ThrottlerStorage } from "@nestjs/throttler";
import { RateLimitGuard } from "../rate-limit.guard";
import { RateLimitException } from "@shared/exceptions/rate-limit.exception";

describe("RateLimitGuard (integration)", () => {
	let guard: RateLimitGuard;
	let storage: ThrottlerStorage;
	let hitCount: number;

	beforeEach(() => {
		hitCount = 0;

		storage = {
			increment: vi.fn().mockImplementation(async (_key: string, ttl: number, limit: number) => {
				hitCount++;
				const isBlocked = hitCount > limit;
				return {
					totalHits: hitCount,
					timeToExpire: Math.ceil(ttl / 1000),
					isBlocked,
					timeToBlockExpire: isBlocked ? 60 : 0,
				};
			}),
		} as unknown as ThrottlerStorage;

		const options: ThrottlerModuleOptions = [{ name: "default", ttl: 60_000, limit: 3 }];
		const reflector = new Reflector();
		guard = new RateLimitGuard(options, storage, reflector);
	});

	function mockContext(tracker: string): ExecutionContext {
		return {
			getHandler: () => ({}),
			getClass: () => ({}),
			switchToHttp: () => ({
				getRequest: () => ({
					headers: {},
					ip: tracker,
					user: tracker.startsWith("user:") ? { id: tracker.replace("user:", "") } : undefined,
				}),
				getResponse: () => ({
					header: vi.fn(),
				}),
			}),
		} as unknown as ExecutionContext;
	}

	it("should allow requests under the rate limit", async () => {
		const context = mockContext("ip:1.2.3.4");

		const result1 = await guard.canActivate(context);
		expect(result1).toBe(true);

		const result2 = await guard.canActivate(context);
		expect(result2).toBe(true);

		const result3 = await guard.canActivate(context);
		expect(result3).toBe(true);
	});

	it("should throw RateLimitException when rate limit is exceeded", async () => {
		const context = mockContext("ip:1.2.3.4");

		await guard.canActivate(context);
		await guard.canActivate(context);
		await guard.canActivate(context);

		await expect(guard.canActivate(context)).rejects.toThrow(RateLimitException);
	});

	it("should track authenticated users by user ID independently of IP", async () => {
		const userContext = mockContext("user:user-123");

		await guard.canActivate(userContext);
		await guard.canActivate(userContext);
		await guard.canActivate(userContext);

		await expect(guard.canActivate(userContext)).rejects.toThrow(RateLimitException);
	});

	it("should not affect rate limit of other users when one user is blocked", async () => {
		const userA = mockContext("user:user-a");
		const userB = mockContext("user:user-b");

		await guard.canActivate(userA);
		await guard.canActivate(userA);
		await guard.canActivate(userA);

		await expect(guard.canActivate(userA)).rejects.toThrow(RateLimitException);

		const resultB = await guard.canActivate(userB);
		expect(resultB).toBe(true);
	});

	it("should include retryAfterSeconds in RateLimitException details", async () => {
		const context = mockContext("ip:1.2.3.4");

		for (let i = 0; i < 3; i++) {
			await guard.canActivate(context);
		}

		try {
			await guard.canActivate(context);
		} catch (error) {
			expect(error).toBeInstanceOf(RateLimitException);
			const rateLimitError = error as RateLimitException;
			expect(rateLimitError.details).toBeDefined();
			expect(rateLimitError.details!["retryAfterSeconds"]).toBe(60);
		}
	});
});
