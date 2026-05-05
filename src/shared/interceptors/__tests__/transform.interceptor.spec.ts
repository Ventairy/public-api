import { describe, it, expect, vi, beforeEach } from "vitest";
import { ExecutionContext, CallHandler } from "@nestjs/common";
import { TransformInterceptor } from "../transform.interceptor";
import { of } from "rxjs";
import { ClsService } from "nestjs-cls";

describe("TransformInterceptor", () => {
	let interceptor: TransformInterceptor<any>;
	let mockContext: ExecutionContext;
	let mockCallHandler: CallHandler;
	let mockClsService: Partial<ClsService>;

	beforeEach(() => {
		mockClsService = {
			getId: vi.fn().mockReturnValue("test-request-id"),
		};
		interceptor = new TransformInterceptor(mockClsService as ClsService);
		mockContext = {} as ExecutionContext;
		mockCallHandler = {
			handle: vi.fn(),
		};
	});

	it("should transform the response into an envelope", async () => {
		const responseData = { id: 1, name: "Test" };
		mockCallHandler.handle = vi.fn().mockReturnValue(of(responseData));

		const result$ = interceptor.intercept(mockContext, mockCallHandler);
		const result = await result$.toPromise();

		expect(result).toEqual({
			data: responseData,
			meta: {
				timestamp: expect.any(String),
				requestId: "test-request-id",
			},
		});
		expect(mockClsService.getId).toHaveBeenCalled();
	});

	it("should use 'unknown' as requestId if ClsService returns null", async () => {
		mockClsService.getId = vi.fn().mockReturnValue(null);
		const responseData = { id: 1 };
		mockCallHandler.handle = vi.fn().mockReturnValue(of(responseData));

		const result$ = interceptor.intercept(mockContext, mockCallHandler);
		const result = await result$.toPromise();

		expect(result?.meta.requestId).toBe("unknown");
	});
});
