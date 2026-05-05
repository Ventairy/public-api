import { describe, it, expect, beforeEach, vi } from "vitest";
import { ArgumentsHost, BadRequestException, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { AllExceptionsFilter } from "@shared/filters/all-exceptions.filter";
import { DomainException } from "@shared/exceptions/domain.exception";
import { ValidationException } from "@shared/exceptions/validation.exception";
import { ERROR_CODES } from "@shared/constants/error-codes";
import type { FieldError } from "@shared/errors/error-response.types";

const getMockClsService = (requestId = "test-request-uuid") => ({
	getId: vi.fn(() => requestId),
});

const getMockHost = (overrides?: {
	requestHeaders?: Record<string, string>;
	requestUrl?: string;
	requestMethod?: string;
	responseStatus?: number;
	responseJson?: (body: unknown) => void;
	responseSetHeader?: (key: string, value: string) => void;
}) => {
	const status = vi.fn().mockReturnValue({
		json: vi.fn(),
	});
	const setHeader = vi.fn();

	const mockResponse = {
		status,
		setHeader: overrides?.responseSetHeader ?? setHeader,
	};

	const mockRequest = {
		url: overrides?.requestUrl ?? "/v1/test",
		method: overrides?.requestMethod ?? "POST",
		headers: overrides?.requestHeaders ?? {},
	};

	const mockHost = {
		switchToHttp: vi.fn().mockReturnValue({
			getResponse: vi.fn().mockReturnValue(mockResponse),
			getRequest: vi.fn().mockReturnValue(mockRequest),
		}),
	} as unknown as ArgumentsHost;

	return {
		mockHost,
		mockResponse,
		mockRequest,
		statusSpy: status,
		jsonSpy: mockResponse.status.mockReturnValue({ json: vi.fn() }).mockReturnValue({ json: vi.fn() }).mock.results?.[0]
			?.value?.json as ReturnType<typeof vi.fn> | undefined,
		setHeaderSpy: setHeader,
	};
};

const getMockFieldError = (overrides?: Partial<FieldError>): FieldError => ({
	path: "wallet_address",
	constraint: "isEthereumAddress",
	message: "wallet_address must be an Ethereum address",
	hint: "Provide a 0x-prefixed 40-character hexadecimal string.",
	received: "KULE",
	...overrides,
});

class MockDomainException extends DomainException {}

describe("AllExceptionsFilter", () => {
	let clsService: ReturnType<typeof getMockClsService>;

	beforeEach(() => {
		vi.clearAllMocks();
		clsService = getMockClsService();
	});

	it("emits domainCode, message, and details from a DomainException", () => {
		const jsonSpy = vi.fn();
		const setHeaderSpy = vi.fn();
		const mockHost = {
			switchToHttp: vi.fn().mockReturnValue({
				getResponse: vi.fn().mockReturnValue({
					status: vi.fn().mockReturnValue({ json: jsonSpy }),
					setHeader: setHeaderSpy,
				}),
				getRequest: vi.fn().mockReturnValue({
					url: "/v1/users",
					method: "POST",
					headers: {},
				}),
			}),
		} as unknown as ArgumentsHost;

		class TestDomainException extends DomainException {
			constructor() {
				super(ERROR_CODES.BAD_REQUEST, "Something went wrong", HttpStatus.BAD_REQUEST, {
					context: { foo: "bar" },
					hint: "Try again",
				});
			}
		}

		const filter = new AllExceptionsFilter(clsService as any);
		filter.catch(new TestDomainException(), mockHost);

		expect(jsonSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				statusCode: 400,
				code: ERROR_CODES.BAD_REQUEST,
				message: "Something went wrong",
				requestId: "test-request-uuid",
				path: "/v1/users",
				method: "POST",
			}),
		);

		const callArg = jsonSpy.mock.calls[0]![0] as Record<string, unknown>;
		expect(callArg["details"]).toBeDefined();
	});

	it("emits details.errors[] from a ValidationException", () => {
		const jsonSpy = vi.fn();
		const mockHost = {
			switchToHttp: vi.fn().mockReturnValue({
				getResponse: vi.fn().mockReturnValue({
					status: vi.fn().mockReturnValue({ json: jsonSpy }),
					setHeader: vi.fn(),
				}),
				getRequest: vi.fn().mockReturnValue({
					url: "/v1/users",
					method: "POST",
					headers: {},
				}),
			}),
		} as unknown as ArgumentsHost;

		const errors = [getMockFieldError(), getMockFieldError({ path: "email" })];
		const exception = new ValidationException(errors);

		const filter = new AllExceptionsFilter(clsService as any);
		filter.catch(exception, mockHost);

		const body = jsonSpy.mock.calls[0]![0] as Record<string, unknown>;
		expect(body["code"]).toBe(ERROR_CODES.VALIDATION_FAILED);
		expect(body["statusCode"]).toBe(400);

		const details = body["details"] as Record<string, unknown>;
		expect(details).toBeDefined();
		expect(details["errors"] as unknown[]).toHaveLength(2);
	});

	it("maps a generic BadRequestException to BAD_REQUEST code", () => {
		const jsonSpy = vi.fn();
		const mockHost = {
			switchToHttp: vi.fn().mockReturnValue({
				getResponse: vi.fn().mockReturnValue({
					status: vi.fn().mockReturnValue({ json: jsonSpy }),
					setHeader: vi.fn(),
				}),
				getRequest: vi.fn().mockReturnValue({
					url: "/v1/test",
					method: "GET",
					headers: {},
				}),
			}),
		} as unknown as ArgumentsHost;

		const exception = new BadRequestException("Bad thing");

		const filter = new AllExceptionsFilter(clsService as any);
		filter.catch(exception, mockHost);

		const body = jsonSpy.mock.calls[0]![0] as Record<string, unknown>;
		expect(body["code"]).toBe(ERROR_CODES.BAD_REQUEST);
		expect(body["statusCode"]).toBe(400);
	});

	it("returns INTERNAL_ERROR with generic message for unknown errors", () => {
		const jsonSpy = vi.fn();
		const mockHost = {
			switchToHttp: vi.fn().mockReturnValue({
				getResponse: vi.fn().mockReturnValue({
					status: vi.fn().mockReturnValue({ json: jsonSpy }),
					setHeader: vi.fn(),
				}),
				getRequest: vi.fn().mockReturnValue({
					url: "/v1/test",
					method: "GET",
					headers: {},
				}),
			}),
		} as unknown as ArgumentsHost;

		const filter = new AllExceptionsFilter(clsService as any);
		filter.catch(new Error("Something broke"), mockHost);

		const body = jsonSpy.mock.calls[0]![0] as Record<string, unknown>;
		expect(body["code"]).toBe(ERROR_CODES.INTERNAL_ERROR);
		expect(body["statusCode"]).toBe(500);
		expect(body["message"]).toBe("An internal error occurred. The incident has been logged.");
	});

	it("populates requestId from CLS even when no x-request-id header", () => {
		const jsonSpy = vi.fn();
		const mockHost = {
			switchToHttp: vi.fn().mockReturnValue({
				getResponse: vi.fn().mockReturnValue({
					status: vi.fn().mockReturnValue({ json: jsonSpy }),
					setHeader: vi.fn(),
				}),
				getRequest: vi.fn().mockReturnValue({
					url: "/v1/test",
					method: "GET",
					headers: {},
				}),
			}),
		} as unknown as ArgumentsHost;

		const filter = new AllExceptionsFilter(clsService as any);
		filter.catch(new Error("fail"), mockHost);

		const body = jsonSpy.mock.calls[0]![0] as Record<string, unknown>;
		expect(body["requestId"]).toBe("test-request-uuid");
		expect(body["requestId"]).not.toBe("unknown");
	});

	it("sets X-Request-Id response header", () => {
		const setHeaderSpy = vi.fn();
		const jsonSpy = vi.fn();
		const mockHost = {
			switchToHttp: vi.fn().mockReturnValue({
				getResponse: vi.fn().mockReturnValue({
					status: vi.fn().mockReturnValue({ json: jsonSpy }),
					setHeader: setHeaderSpy,
				}),
				getRequest: vi.fn().mockReturnValue({
					url: "/v1/test",
					method: "GET",
					headers: {},
				}),
			}),
		} as unknown as ArgumentsHost;

		const filter = new AllExceptionsFilter(clsService as any);
		filter.catch(new Error("fail"), mockHost);

		expect(setHeaderSpy).toHaveBeenCalledWith("X-Request-Id", "test-request-uuid");
	});

	it("handles non-Error thrown values", () => {
		const jsonSpy = vi.fn();
		const mockHost = {
			switchToHttp: vi.fn().mockReturnValue({
				getResponse: vi.fn().mockReturnValue({
					status: vi.fn().mockReturnValue({ json: jsonSpy }),
					setHeader: vi.fn(),
				}),
				getRequest: vi.fn().mockReturnValue({
					url: "/v1/test",
					method: "GET",
					headers: {},
				}),
			}),
		} as unknown as ArgumentsHost;

		const filter = new AllExceptionsFilter(clsService as any);
		filter.catch("string error", mockHost);

		const body = jsonSpy.mock.calls[0]![0] as Record<string, unknown>;
		expect(body["statusCode"]).toBe(500);
		expect(body["code"]).toBe(ERROR_CODES.INTERNAL_ERROR);
	});

	it("handles HttpException with array of messages", () => {
		const jsonSpy = vi.fn();
		const mockHost = {
			switchToHttp: vi.fn().mockReturnValue({
				getResponse: vi.fn().mockReturnValue({
					status: vi.fn().mockReturnValue({ json: jsonSpy }),
					setHeader: vi.fn(),
				}),
				getRequest: vi.fn().mockReturnValue({
					url: "/v1/test",
					method: "GET",
					headers: {},
				}),
			}),
		} as unknown as ArgumentsHost;

		const exception = new BadRequestException({
			message: ["Error 1", "Error 2"],
			code: "CUSTOM_CODE",
		});

		const filter = new AllExceptionsFilter(clsService as any);
		filter.catch(exception, mockHost);

		const body = jsonSpy.mock.calls[0]![0] as Record<string, unknown>;
		expect(body["message"]).toBe("Error 1; Error 2");
		expect(body["code"]).toBe("CUSTOM_CODE");
	});

	it("handles DomainException with partial details", () => {
		const jsonSpy = vi.fn();
		const mockHost = {
			switchToHttp: vi.fn().mockReturnValue({
				getResponse: vi.fn().mockReturnValue({
					status: vi.fn().mockReturnValue({ json: jsonSpy }),
					setHeader: vi.fn(),
				}),
				getRequest: vi.fn().mockReturnValue({
					url: "/v1/test",
					method: "GET",
					headers: {},
				}),
			}),
		} as unknown as ArgumentsHost;

		const exception = new MockDomainException(ERROR_CODES.BAD_REQUEST, "Msg", 400, {
			hint: "Do this",
			context: { key: "val" },
		});

		const filter = new AllExceptionsFilter(clsService as any);
		filter.catch(exception, mockHost);

		const body = jsonSpy.mock.calls[0]![0] as Record<string, unknown>;
		const details = body["details"] as any;
		expect(details.hint).toBe("Do this");
		expect(details.context).toEqual({ key: "val" });
		expect(details.errors).toBeUndefined();
	});

	it("logs error with cause if present", () => {
		const errorSpy = vi.spyOn(Logger.prototype, "error").mockImplementation(() => {});
		const mockHost = {
			switchToHttp: vi.fn().mockReturnValue({
				getResponse: vi.fn().mockReturnValue({
					status: vi.fn().mockReturnValue({ json: vi.fn() }),
					setHeader: vi.fn(),
				}),
				getRequest: vi.fn().mockReturnValue({
					url: "/v1/test",
					method: "GET",
					headers: {},
				}),
			}),
		} as unknown as ArgumentsHost;

		const cause = new Error("Original cause");
		const exception = new Error("Main error", { cause });

		const filter = new AllExceptionsFilter(clsService as any);
		filter.catch(exception, mockHost);

		expect(errorSpy).toHaveBeenCalledWith(
			expect.any(String),
			expect.stringContaining("Caused by: Error: Original cause"),
			expect.any(String),
		);
	});

	it("handles HttpException with string response (no message object)", () => {
		const jsonSpy = vi.fn();
		const mockHost = {
			switchToHttp: vi.fn().mockReturnValue({
				getResponse: vi.fn().mockReturnValue({
					status: vi.fn().mockReturnValue({ json: jsonSpy }),
					setHeader: vi.fn(),
				}),
				getRequest: vi.fn().mockReturnValue({
					url: "/v1/test",
					method: "GET",
					headers: {},
				}),
			}),
		} as unknown as ArgumentsHost;

		// NestJS typically wraps strings, but we can simulate a raw response
		const exception = new HttpException("Raw error string", 400);
		vi.spyOn(exception, "getResponse").mockReturnValue("Raw error string");

		const filter = new AllExceptionsFilter(clsService as any);
		filter.catch(exception, mockHost);

		const body = jsonSpy.mock.calls[0]![0] as Record<string, unknown>;
		expect(body["message"]).toBe("Raw error string");
		expect(body["details"]).toBeUndefined();
	});

	it("returns 'unexpected error' for non-standard 4xx errors", () => {
		const jsonSpy = vi.fn();
		const mockHost = {
			switchToHttp: vi.fn().mockReturnValue({
				getResponse: vi.fn().mockReturnValue({
					status: vi.fn().mockReturnValue({ json: jsonSpy }),
					setHeader: vi.fn(),
				}),
				getRequest: vi.fn().mockReturnValue({
					url: "/v1/test",
					method: "GET",
					headers: {},
				}),
			}),
		} as unknown as ArgumentsHost;

		const filter = new AllExceptionsFilter(clsService as any);
		// Force a 400 status but with a generic object that isn't an instance of HttpException
		vi.spyOn(filter as any, "resolveStatusCode").mockReturnValue(400);

		filter.catch({ custom: "error" }, mockHost);

		const body = jsonSpy.mock.calls[0]![0] as Record<string, unknown>;
		expect(body["message"]).toBe("An unexpected error occurred.");
	});

	it("handles DomainException with no details", () => {
		const jsonSpy = vi.fn();
		const mockHost = {
			switchToHttp: vi.fn().mockReturnValue({
				getResponse: vi.fn().mockReturnValue({
					status: vi.fn().mockReturnValue({ json: jsonSpy }),
					setHeader: vi.fn(),
				}),
				getRequest: vi.fn().mockReturnValue({
					url: "/v1/test",
					method: "GET",
					headers: {},
				}),
			}),
		} as unknown as ArgumentsHost;

		const exception = new MockDomainException(ERROR_CODES.BAD_REQUEST, "Msg", 400);

		const filter = new AllExceptionsFilter(clsService as any);
		filter.catch(exception, mockHost);

		const body = jsonSpy.mock.calls[0]![0] as Record<string, unknown>;
		expect(body["details"]).toBeUndefined();
	});

	it("handles DomainException with empty details object", () => {
		const jsonSpy = vi.fn();
		const mockHost = {
			switchToHttp: vi.fn().mockReturnValue({
				getResponse: vi.fn().mockReturnValue({
					status: vi.fn().mockReturnValue({ json: jsonSpy }),
					setHeader: vi.fn(),
				}),
				getRequest: vi.fn().mockReturnValue({
					url: "/v1/test",
					method: "GET",
					headers: {},
				}),
			}),
		} as unknown as ArgumentsHost;

		const exception = new MockDomainException(ERROR_CODES.BAD_REQUEST, "Msg", 400, {} as any);

		const filter = new AllExceptionsFilter(clsService as any);
		filter.catch(exception, mockHost);

		const body = jsonSpy.mock.calls[0]![0] as Record<string, unknown>;
		expect(body["details"]).toBeUndefined();
	});

	it("handles HttpException with object response but no message array", () => {
		const jsonSpy = vi.fn();
		const mockHost = {
			switchToHttp: vi.fn().mockReturnValue({
				getResponse: vi.fn().mockReturnValue({
					status: vi.fn().mockReturnValue({ json: jsonSpy }),
					setHeader: vi.fn(),
				}),
				getRequest: vi.fn().mockReturnValue({
					url: "/v1/test",
					method: "GET",
					headers: {},
				}),
			}),
		} as unknown as ArgumentsHost;

		const exception = new HttpException({ foo: "bar", message: "Single message" }, 400);

		const filter = new AllExceptionsFilter(clsService as any);
		filter.catch(exception, mockHost);

		const body = jsonSpy.mock.calls[0]![0] as Record<string, unknown>;
		expect(body["message"]).toBe("Single message");
		expect(body["details"]).toBeUndefined();
	});

	it("handles DomainException with errors in details", () => {
		const jsonSpy = vi.fn();
		const mockHost = {
			switchToHttp: vi.fn().mockReturnValue({
				getResponse: vi.fn().mockReturnValue({
					status: vi.fn().mockReturnValue({ json: jsonSpy }),
					setHeader: vi.fn(),
				}),
				getRequest: vi.fn().mockReturnValue({
					url: "/v1/test",
					method: "GET",
					headers: {},
				}),
			}),
		} as unknown as ArgumentsHost;

		const fieldErrors = [{ path: "field", message: "error", constraint: "rule" }];
		const exception = new MockDomainException(ERROR_CODES.BAD_REQUEST, "Msg", 400, {
			errors: fieldErrors,
		});

		const filter = new AllExceptionsFilter(clsService as any);
		filter.catch(exception, mockHost);

		const body = jsonSpy.mock.calls[0]![0] as Record<string, unknown>;
		const details = body["details"] as any;
		expect(details.errors).toEqual(fieldErrors);
	});
});
