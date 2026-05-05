import { describe, it, expect, vi, beforeEach } from "vitest";
import { ExecutionContext, CallHandler, Logger } from "@nestjs/common";
import { AuditInterceptor } from "../audit.interceptor";
import { of } from "rxjs";
import { ClsService } from "nestjs-cls";

describe("AuditInterceptor", () => {
	let interceptor: AuditInterceptor;
	let mockContext: any;
	let mockCallHandler: CallHandler;
	let mockClsService: Partial<ClsService>;
	let loggerSpy: any;

	beforeEach(() => {
		mockClsService = {
			get: vi.fn(),
			getId: vi.fn().mockReturnValue("test-request-id"),
		};
		interceptor = new AuditInterceptor(mockClsService as ClsService);
		
		loggerSpy = vi.spyOn(Logger.prototype, "log").mockImplementation(() => {});

		mockContext = {
			switchToHttp: vi.fn().mockReturnValue({
				getRequest: vi.fn().mockReturnValue({
					method: "POST",
					url: "/v1/users",
					user: { id: "user-from-request" },
				}),
			}),
		};

		mockCallHandler = {
			handle: vi.fn(),
		};
	});

	it("should log audit details using actorId from CLS", async () => {
		mockClsService.get = vi.fn().mockReturnValue("actor-from-cls");
		mockCallHandler.handle = vi.fn().mockReturnValue(of({ id: 1 }));

		const result$ = interceptor.intercept(mockContext, mockCallHandler);
		await result$.toPromise();

		expect(loggerSpy).toHaveBeenCalled();
		const logBody = JSON.parse(loggerSpy.mock.calls[0][0]);
		expect(logBody).toMatchObject({
			actorId: "actor-from-cls",
			action: "POST /v1/users",
			requestId: "test-request-id",
		});
		expect(logBody.timestamp).toBeDefined();
	});

	it("should fallback to actorId from request user if CLS is empty", async () => {
		mockClsService.get = vi.fn().mockReturnValue(undefined);
		mockCallHandler.handle = vi.fn().mockReturnValue(of({ id: 1 }));

		const result$ = interceptor.intercept(mockContext, mockCallHandler);
		await result$.toPromise();

		const logBody = JSON.parse(loggerSpy.mock.calls[0][0]);
		expect(logBody.actorId).toBe("user-from-request");
	});

	it("should use 'anonymous' if no actorId is found", async () => {
		mockClsService.get = vi.fn().mockReturnValue(undefined);
		mockContext.switchToHttp().getRequest.mockReturnValue({
			method: "GET",
			url: "/public",
		});
		mockCallHandler.handle = vi.fn().mockReturnValue(of({ ok: true }));

		const result$ = interceptor.intercept(mockContext, mockCallHandler);
		await result$.toPromise();

		const logBody = JSON.parse(loggerSpy.mock.calls[0][0]);
		expect(logBody.actorId).toBe("anonymous");
	});

  it("should use 'unknown' as requestId if ClsService returns null", async () => {
    mockClsService.getId = vi.fn().mockReturnValue(null);
    mockCallHandler.handle = vi.fn().mockReturnValue(of({ ok: true }));

    const result$ = interceptor.intercept(mockContext, mockCallHandler);
    await result$.toPromise();

    const logBody = JSON.parse(loggerSpy.mock.calls[0][0]);
    expect(logBody.requestId).toBe("unknown");
  });
});
