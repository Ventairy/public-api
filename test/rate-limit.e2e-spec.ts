import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Test, type TestingModule } from "@nestjs/testing";
import { Controller, Get, HttpCode, HttpStatus, INestApplication } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import supertest from "supertest";
import { RateLimitGuard } from "@shared/rate-limit/rate-limit.guard";
import { RateLimit } from "@shared/rate-limit/rate-limit.decorator";
import { Public } from "@shared/decorators/public.decorator";

@Controller("test")
class TestRateLimitController {
	@Get("strict")
	@HttpCode(HttpStatus.OK)
	@Public()
	@RateLimit({ limit: 3, ttlSeconds: 60 })
	strictEndpoint(): { ok: boolean } {
		return { ok: true };
	}

	@Get("generous")
	@HttpCode(HttpStatus.OK)
	@Public()
	@RateLimit({ limit: 100, ttlSeconds: 60 })
	generousEndpoint(): { ok: boolean } {
		return { ok: true };
	}

	@Get("decrease")
	@HttpCode(HttpStatus.OK)
	@Public()
	@RateLimit({ limit: 100, ttlSeconds: 60 })
	decreaseEndpoint(): { ok: boolean } {
		return { ok: true };
	}
}

describe("RateLimit HTTP (e2e)", () => {
	let app: INestApplication;
	let module: TestingModule;

	beforeAll(async () => {
		module = await Test.createTestingModule({
			imports: [
				ThrottlerModule.forRoot([
					{ name: "default", ttl: 60_000, limit: 100 },
				]),
			],
			controllers: [TestRateLimitController],
			providers: [
				{
					provide: APP_GUARD,
					useClass: RateLimitGuard,
				},
			],
		}).compile();

		app = module.createNestApplication();
		app.set("trust proxy", true);
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	it("should allow requests under the rate limit", async () => {
		const response = await supertest(app.getHttpServer())
			.get("/test/generous")
			.expect(HttpStatus.OK);

		expect(response.body).toEqual({ ok: true });
	});

	it("should include X-RateLimit headers on successful responses", async () => {
		const response = await supertest(app.getHttpServer())
			.get("/test/generous")
			.expect(HttpStatus.OK);

		expect(response.headers["x-ratelimit-limit"]).toBeDefined();
		expect(response.headers["x-ratelimit-remaining"]).toBeDefined();
		expect(response.headers["x-ratelimit-reset"]).toBeDefined();
	});

	it("should return 429 when rate limit is exceeded and include Retry-After", async () => {
		for (let i = 0; i < 3; i++) {
			await supertest(app.getHttpServer())
				.get("/test/strict")
				.expect(HttpStatus.OK);
		}

		const response = await supertest(app.getHttpServer())
			.get("/test/strict")
			.expect(HttpStatus.TOO_MANY_REQUESTS);

		expect(response.headers["retry-after"]).toBeDefined();
	});

	it("should decrease X-RateLimit-Remaining on each request", async () => {
		const response1 = await supertest(app.getHttpServer())
			.get("/test/decrease")
			.expect(HttpStatus.OK);

		const remaining1 = Number(response1.headers["x-ratelimit-remaining"]);

		const response2 = await supertest(app.getHttpServer())
			.get("/test/decrease")
			.expect(HttpStatus.OK);

		const remaining2 = Number(response2.headers["x-ratelimit-remaining"]);

		expect(remaining2).toBeLessThan(remaining1);
	});
});
