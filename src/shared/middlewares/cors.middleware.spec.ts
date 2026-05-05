import { ConfigService } from "@nestjs/config";
import { Request, Response, NextFunction } from "express";
import { CorsMiddleware } from "./cors.middleware";
import { APP_CONFIG_KEY } from "@core/config";
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("CorsMiddleware", () => {
	let middleware: CorsMiddleware;
	let configService: ConfigService;

	const mockResponse = () => {
		const res = {} as Response;
		res.status = vi.fn().mockReturnValue(res);
		res.json = vi.fn().mockReturnValue(res);
		res.setHeader = vi.fn().mockReturnValue(res);
		res.end = vi.fn().mockReturnValue(res);
		return res;
	};

	const mockNext = vi.fn() as NextFunction;

	beforeEach(() => {
		vi.clearAllMocks();
		configService = {
			get: vi.fn((key: string) => {
				if (key === APP_CONFIG_KEY) {
					return {
						nodeEnv: "production",
						corsAllowedDomains: ["ventairy.com"],
					};
				}
				return null;
			}),
		} as unknown as ConfigService;

		middleware = new CorsMiddleware(configService);
	});

	it("should be defined", () => {
		expect(middleware).toBeDefined();
	});

	describe("Production Environment", () => {
		it("should allow origin if it matches allowed domain suffix", () => {
			const req = {
				headers: { origin: "https://app.ventairy.com" },
				method: "GET",
			} as Request;
			const res = mockResponse();

			middleware.use(req, res, mockNext);

			expect(res.setHeader).toHaveBeenCalledWith(
				"Access-Control-Allow-Origin",
				"https://app.ventairy.com",
			);
			expect(mockNext).toHaveBeenCalled();
		});

		it("should deny origin if it does not match allowed domain suffix", () => {
			const req = {
				headers: { origin: "https://evil.com" },
				method: "GET",
			} as Request;
			const res = mockResponse();

			middleware.use(req, res, mockNext);

			expect(res.status).toHaveBeenCalledWith(403);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					code: "CORS_FORBIDDEN",
				}),
			);
			expect(mockNext).not.toHaveBeenCalled();
		});
	});

	describe("Development Environment", () => {
		it("should allow any origin in development mode", () => {
			const devConfigService = {
				get: vi.fn((key: string) => {
					if (key === APP_CONFIG_KEY) {
						return {
							nodeEnv: "development",
							corsAllowedDomains: ["ventairy.com"],
						};
					}
					return null;
				}),
			} as unknown as ConfigService;

			const devMiddleware = new CorsMiddleware(devConfigService);

			const req = {
				headers: { origin: "https://any-origin.com" },
				method: "GET",
			} as Request;
			const res = mockResponse();

			devMiddleware.use(req, res, mockNext);

			expect(res.setHeader).toHaveBeenCalledWith(
				"Access-Control-Allow-Origin",
				"https://any-origin.com",
			);
			expect(mockNext).toHaveBeenCalled();
		});
	});

	describe("Edge Cases", () => {
		it("should call next() if no origin is present", () => {
			const req = { headers: {}, method: "GET" } as Request;
			const res = mockResponse();

			middleware.use(req, res, mockNext);

			expect(mockNext).toHaveBeenCalled();
			expect(res.setHeader).not.toHaveBeenCalled();
		});

		it("should return 204 for OPTIONS request", () => {
			const req = {
				headers: { origin: "https://ventairy.com" },
				method: "OPTIONS",
			} as Request;
			const res = mockResponse();

			middleware.use(req, res, mockNext);

			expect(res.status).toHaveBeenCalledWith(204);
			expect(res.end).toHaveBeenCalled();
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("should handle invalid origin URL", () => {
			const req = {
				headers: { origin: "invalid-url" },
				method: "GET",
			} as Request;
			const res = mockResponse();

			middleware.use(req, res, mockNext);

			expect(res.status).toHaveBeenCalledWith(403);
		});

    it("should throw error if config is missing", () => {
      const emptyConfig = { get: vi.fn().mockReturnValue(null) } as unknown as ConfigService;
      expect(() => new CorsMiddleware(emptyConfig)).toThrow("Application configuration is missing");
    });
	});
});
