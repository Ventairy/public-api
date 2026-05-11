import { describe, it, expect, vi, beforeEach } from "vitest";
import { ExecutionContext, CallHandler, RequestTimeoutException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TimeoutInterceptor } from "../timeout.interceptor";
import { of, throwError, TimeoutError } from "rxjs";

describe("TimeoutInterceptor", () => {
	let interceptor: TimeoutInterceptor;
	let mockContext: ExecutionContext;
	let mockCallHandler: CallHandler;
	let mockConfigService: { getOrThrow: ReturnType<typeof vi.fn> };

	const createInterceptor = (): TimeoutInterceptor =>
		new TimeoutInterceptor(mockConfigService as unknown as ConfigService);

	beforeEach(() => {
		mockConfigService = { getOrThrow: vi.fn() };
		mockContext = {} as ExecutionContext;
		mockCallHandler = {
			handle: vi.fn(),
		};
	});

	it("should read timeout from ConfigService", () => {
		mockConfigService.getOrThrow = vi.fn().mockReturnValue({ requestTimeoutMs: 5000 });
		interceptor = createInterceptor();

		expect(mockConfigService.getOrThrow).toHaveBeenCalledWith("app");
	});

	it("should pass through the response if it completes before timeout", async () => {
		mockConfigService.getOrThrow = vi.fn().mockReturnValue({ requestTimeoutMs: 10000 });
		interceptor = createInterceptor();

		const responseData = { success: true };
		mockCallHandler.handle = vi.fn().mockReturnValue(of(responseData));

		const result$ = interceptor.intercept(mockContext, mockCallHandler);
		const result = await result$.toPromise();

		expect(result).toBe(responseData);
		expect(mockCallHandler.handle).toHaveBeenCalled();
	});

	it("should throw RequestTimeoutException when rxjs TimeoutError occurs", async () => {
		mockConfigService.getOrThrow = vi.fn().mockReturnValue({ requestTimeoutMs: 10000 });
		interceptor = createInterceptor();

		mockCallHandler.handle = vi.fn().mockReturnValue(throwError(() => new TimeoutError()));

		const result$ = interceptor.intercept(mockContext, mockCallHandler);

		await expect(result$.toPromise()).rejects.toThrow(RequestTimeoutException);
	});

	it("should throw the original error if it is not a TimeoutError", async () => {
		mockConfigService.getOrThrow = vi.fn().mockReturnValue({ requestTimeoutMs: 10000 });
		interceptor = createInterceptor();

		const originalError = new Error("Something else");
		mockCallHandler.handle = vi.fn().mockReturnValue(throwError(() => originalError));

		const result$ = interceptor.intercept(mockContext, mockCallHandler);

		await expect(result$.toPromise()).rejects.toThrow(originalError);
	});
});
