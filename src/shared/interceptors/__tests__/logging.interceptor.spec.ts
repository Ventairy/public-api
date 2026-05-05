import { describe, it, expect, vi, beforeEach } from "vitest";
import { ExecutionContext, CallHandler, Logger } from "@nestjs/common";
import { LoggingInterceptor } from "../logging.interceptor";
import { of, throwError } from "rxjs";

describe("LoggingInterceptor", () => {
	let interceptor: LoggingInterceptor;
	let mockContext: any;
	let mockCallHandler: CallHandler;
	let loggerLogSpy: any;
	let loggerErrorSpy: any;

	beforeEach(() => {
		interceptor = new LoggingInterceptor();
		
		// Mock Logger prototype since it's instantiated inside the class
		loggerLogSpy = vi.spyOn(Logger.prototype, "log").mockImplementation(() => {});
		loggerErrorSpy = vi.spyOn(Logger.prototype, "error").mockImplementation(() => {});

		mockContext = {
			switchToHttp: vi.fn().mockReturnValue({
				getRequest: vi.fn().mockReturnValue({
					method: "GET",
					url: "/test",
				}),
				getResponse: vi.fn().mockReturnValue({
					statusCode: 200,
				}),
			}),
		};

		mockCallHandler = {
			handle: vi.fn(),
		};
	});

	it("should log the request and response details on success", async () => {
		mockCallHandler.handle = vi.fn().mockReturnValue(of({ success: true }));

		const result$ = interceptor.intercept(mockContext, mockCallHandler);
		await result$.toPromise();

		expect(loggerLogSpy).toHaveBeenCalledWith(expect.stringContaining("GET /test 200"));
	});

	it("should log the request and error details on failure", async () => {
		const error = new Error("Boom") as any;
		error.status = 400;
		mockCallHandler.handle = vi.fn().mockReturnValue(throwError(() => error));

		const result$ = interceptor.intercept(mockContext, mockCallHandler);
		
		try {
			await result$.toPromise();
		} catch (e) {
			// Expected
		}

		expect(loggerErrorSpy).toHaveBeenCalledWith(expect.stringContaining("GET /test 400"));
		expect(loggerErrorSpy).toHaveBeenCalledWith(expect.stringContaining("Boom"));
	});

  it("should default to status 500 if error has no status", async () => {
		const error = new Error("Generic error");
		mockCallHandler.handle = vi.fn().mockReturnValue(throwError(() => error));

		const result$ = interceptor.intercept(mockContext, mockCallHandler);
		
		try {
			await result$.toPromise();
		} catch (e) {
			// Expected
		}

		expect(loggerErrorSpy).toHaveBeenCalledWith(expect.stringContaining("GET /test 500"));
		expect(loggerErrorSpy).toHaveBeenCalledWith(expect.stringContaining("Generic error"));
	});
});
