import { describe, it, expect } from "vitest";
import { ValidationException } from "@shared/exceptions/validation.exception";
import { AllExceptionsFilter } from "@shared/filters/all-exceptions.filter";
import { ClsService } from "nestjs-cls";
import type { ArgumentsHost } from "@nestjs/common";
import type { FieldError } from "@shared/errors/error-response.types";

const getMockFieldError = (overrides?: Partial<FieldError>): FieldError => ({
	path: "wallet_address",
	constraint: "isEthereumAddress",
	message: "wallet_address must be an Ethereum address",
	hint: "Provide a 0x-prefixed 40-character hexadecimal string.",
	received: "KULE",
	...overrides,
});

const createMockHost = (requestOverrides?: { url?: string; method?: string; headers?: Record<string, string> }) => {
	const jsonSpy = vi.fn();
	const setHeaderSpy = vi.fn();

	return {
		mockHost: {
			switchToHttp: vi.fn().mockReturnValue({
				getResponse: vi.fn().mockReturnValue({
					status: vi.fn().mockReturnValue({ json: jsonSpy }),
					setHeader: setHeaderSpy,
				}),
				getRequest: vi.fn().mockReturnValue({
					url: requestOverrides?.url ?? "/v1/users/create",
					method: requestOverrides?.method ?? "POST",
					headers: requestOverrides?.headers ?? {},
				}),
			}),
		} as unknown as ArgumentsHost,
		jsonSpy,
		setHeaderSpy,
	};
};

const createMockClsService = (requestId = "test-uuid-123") =>
	({
		getId: vi.fn(() => requestId),
	}) as unknown as ClsService;

describe("Error Response Contract (Integration)", () => {
	it("returns rich validation error for invalid wallet address", () => {
		const { mockHost, jsonSpy } = createMockHost();
		const clsService = createMockClsService();

		const errors: FieldError[] = [
			{
				path: "wallet_address",
				constraint: "isEthereumAddress",
				message: "wallet_address must be an Ethereum address",
				hint: "Provide a 0x-prefixed 40-character hexadecimal string (e.g. 0x742d35Cc6634C0532925a3b844Bc9e7595f0BEb1).",
				received: "KULE",
			},
		];
		const exception = new ValidationException(errors);

		const filter = new AllExceptionsFilter(clsService);
		filter.catch(exception, mockHost);

		const body = jsonSpy.mock.calls[0]![0] as Record<string, unknown>;

		expect(body["statusCode"]).toBe(400);
		expect(body["code"]).toBe("VALIDATION_FAILED");
		expect(body["message"]).toBe("Request validation failed: 1 field has an invalid value.");
		expect(body["requestId"]).toBe("test-uuid-123");
		expect(body["requestId"]).not.toBe("unknown");
		expect(body["path"]).toBe("/v1/users/create");
		expect(body["method"]).toBe("POST");
		expect(body["details"]).toBeDefined();

		const details = body["details"] as Record<string, unknown>;
		const errorList = details["errors"] as Record<string, unknown>[];
		expect(errorList).toHaveLength(1);

		const error = errorList[0]!;
		expect(error["path"]).toBe("wallet_address");
		expect(error["constraint"]).toBe("isEthereumAddress");
		expect(error["received"]).toBe("KULE");
		expect(error["hint"]).toContain("0x-prefixed");
	});

	it("returns multiple field errors in a single response", () => {
		const { mockHost, jsonSpy } = createMockHost();
		const clsService = createMockClsService();

		const errors: FieldError[] = [
			getMockFieldError(),
			getMockFieldError({
				path: "email",
				constraint: "isEmail",
				message: "email must be an email",
				hint: "Provide a valid email address (e.g. user@example.com).",
				received: "not-an-email",
			}),
		];
		const exception = new ValidationException(errors);

		const filter = new AllExceptionsFilter(clsService);
		filter.catch(exception, mockHost);

		const body = jsonSpy.mock.calls[0]![0] as Record<string, unknown>;
		expect(body["message"]).toBe("Request validation failed: 2 fields have invalid values.");

		const details = body["details"] as Record<string, unknown>;
		expect(details["errors"] as unknown[]).toHaveLength(2);
	});

	it("sets X-Request-Id response header on error", () => {
		const { mockHost, jsonSpy, setHeaderSpy } = createMockHost();
		const clsService = createMockClsService("my-request-id");

		const exception = new ValidationException([getMockFieldError()]);

		const filter = new AllExceptionsFilter(clsService);
		filter.catch(exception, mockHost);

		expect(setHeaderSpy).toHaveBeenCalledWith("X-Request-Id", "my-request-id");

		const body = jsonSpy.mock.calls[0]![0] as Record<string, unknown>;
		expect(body["requestId"]).toBe("my-request-id");
	});

	it("echoes client-provided request ID via CLS", () => {
		const { mockHost, jsonSpy } = createMockHost({
			headers: { "x-request-id": "client-provided-id" },
		});
		const clsService = createMockClsService("client-provided-id");

		const exception = new ValidationException([getMockFieldError()]);

		const filter = new AllExceptionsFilter(clsService);
		filter.catch(exception, mockHost);

		const body = jsonSpy.mock.calls[0]![0] as Record<string, unknown>;
		expect(body["requestId"]).toBe("client-provided-id");
	});
});
