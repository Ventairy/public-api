import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSiweMessageConstructor = vi.fn();

vi.mock("siwe", () => ({
	SiweMessage: function (...args: unknown[]) {
		return mockSiweMessageConstructor(...args);
	},
}));

import {
	parseSiweMessage,
	validateSiweMessageDomain,
	validateSiweMessageUri,
	validateSiweMessageChainId,
	validateSiweMessageExpiration,
	validateSiweMessageNonce,
	parseAndValidateSiweMessage,
} from "../siwe-utils";
import { SiweMessageInvalidException } from "@shared/exceptions/siwe-message-invalid.exception";

const SIWE_CONFIG = {
	domain: "ventairy.com",
	uri: "https://ventairy.com",
	nonceTtlSeconds: 180,
};

function createMockMessage(overrides: Record<string, unknown> = {}) {
	return {
		domain: "ventairy.com",
		uri: "https://ventairy.com",
		address: "0x742d35cc6634c0532925a3b844bc9e7595f0beb1",
		chainId: 8453,
		nonce: "ABCDEFGH12345678",
		expirationTime: new Date(Date.now() + 600_000).toISOString(),
		...overrides,
	};
}

describe("parseSiweMessage", () => {
	it("should return a parsed SiweMessage for a valid message", () => {
		const mockMessage = createMockMessage();
		mockSiweMessageConstructor.mockReturnValue(mockMessage);

		const result = parseSiweMessage("valid-siwe-message");

		expect(mockSiweMessageConstructor).toHaveBeenCalledWith("valid-siwe-message");
		expect(result).toBe(mockMessage);
	});

	it("should throw SiweMessageInvalidException when parsing fails", () => {
		mockSiweMessageConstructor.mockImplementation(() => {
			throw new Error("parse error");
		});

		expect(() => parseSiweMessage("invalid")).toThrow(SiweMessageInvalidException);
		expect(() => parseSiweMessage("invalid")).toThrow("message could not be parsed as a valid ERC-4361 SIWE message");
	});
});

describe("validateSiweMessageDomain", () => {
	it("should pass when domain matches the expected domain", () => {
		const message = createMockMessage({ domain: "ventairy.com" });

		expect(() => validateSiweMessageDomain(message as any, "ventairy.com")).not.toThrow();
	});

	it("should throw SiweMessageInvalidException when domain does not match", () => {
		const message = createMockMessage({ domain: "evil.com" });

		expect(() => validateSiweMessageDomain(message as any, "ventairy.com")).toThrow(SiweMessageInvalidException);
		expect(() => validateSiweMessageDomain(message as any, "ventairy.com")).toThrow(
			'domain mismatch: expected "ventairy.com", got "evil.com"',
		);
	});
});

describe("validateSiweMessageUri", () => {
	it("should pass when URI matches the expected URI", () => {
		const message = createMockMessage({ uri: "https://ventairy.com" });

		expect(() => validateSiweMessageUri(message as any, "https://ventairy.com")).not.toThrow();
	});

	it("should throw SiweMessageInvalidException when URI does not match", () => {
		const message = createMockMessage({ uri: "https://evil.com" });

		expect(() => validateSiweMessageUri(message as any, "https://ventairy.com")).toThrow(SiweMessageInvalidException);
		expect(() => validateSiweMessageUri(message as any, "https://ventairy.com")).toThrow(
			'uri mismatch: expected "https://ventairy.com", got "https://evil.com"',
		);
	});
});

describe("validateSiweMessageChainId", () => {
	it("should pass for a supported chain ID (Base = 8453)", () => {
		const message = createMockMessage({ chainId: 8453 });

		expect(() => validateSiweMessageChainId(message as any)).not.toThrow();
	});

	it("should throw SiweMessageInvalidException for an unsupported chain ID", () => {
		const message = createMockMessage({ chainId: 999 });

		expect(() => validateSiweMessageChainId(message as any)).toThrow(SiweMessageInvalidException);
		expect(() => validateSiweMessageChainId(message as any)).toThrow("unsupported chain ID: 999");
	});
});

describe("validateSiweMessageExpiration", () => {
	it("should pass when expirationTime is undefined (optional field)", () => {
		const message = createMockMessage({ expirationTime: undefined });

		expect(() => validateSiweMessageExpiration(message as any)).not.toThrow();
	});

	it("should pass when expirationTime is in the future", () => {
		const message = createMockMessage({
			expirationTime: new Date(Date.now() + 60_000).toISOString(),
		});

		expect(() => validateSiweMessageExpiration(message as any)).not.toThrow();
	});

	it("should throw SiweMessageInvalidException when expirationTime is in the past", () => {
		const message = createMockMessage({
			expirationTime: new Date(Date.now() - 60_000).toISOString(),
		});

		expect(() => validateSiweMessageExpiration(message as any)).toThrow(SiweMessageInvalidException);
		expect(() => validateSiweMessageExpiration(message as any)).toThrow("message has expired");
	});
});

describe("validateSiweMessageNonce", () => {
	it("should pass when nonce is present and at least 8 characters", () => {
		const message = createMockMessage({ nonce: "ABCDEFGH12345678" });

		expect(() => validateSiweMessageNonce(message as any)).not.toThrow();
	});

	it("should throw SiweMessageInvalidException when nonce is missing", () => {
		const message = createMockMessage({ nonce: undefined });

		expect(() => validateSiweMessageNonce(message as any)).toThrow(SiweMessageInvalidException);
		expect(() => validateSiweMessageNonce(message as any)).toThrow("nonce is missing or too short");
	});

	it("should throw SiweMessageInvalidException when nonce is empty string", () => {
		const message = createMockMessage({ nonce: "" });

		expect(() => validateSiweMessageNonce(message as any)).toThrow(SiweMessageInvalidException);
	});

	it("should throw SiweMessageInvalidException when nonce is shorter than 8 characters", () => {
		const message = createMockMessage({ nonce: "AB" });

		expect(() => validateSiweMessageNonce(message as any)).toThrow(SiweMessageInvalidException);
		expect(() => validateSiweMessageNonce(message as any)).toThrow("nonce is missing or too short");
	});

	it("should throw SiweMessageInvalidException when nonce is exactly 7 characters", () => {
		const message = createMockMessage({ nonce: "1234567" });

		expect(() => validateSiweMessageNonce(message as any)).toThrow(SiweMessageInvalidException);
	});
});

describe("parseAndValidateSiweMessage", () => {
	it("should parse and pass all validations for a valid message", () => {
		const mockMessage = createMockMessage();
		mockSiweMessageConstructor.mockReturnValue(mockMessage);

		const result = parseAndValidateSiweMessage("valid-message", { siweConfig: SIWE_CONFIG });

		expect(result).toBe(mockMessage);
	});

	it("should throw if parsing fails", () => {
		mockSiweMessageConstructor.mockImplementation(() => {
			throw new Error("parse error");
		});

		expect(() => parseAndValidateSiweMessage("invalid", { siweConfig: SIWE_CONFIG })).toThrow(
			SiweMessageInvalidException,
		);
	});

	it("should throw if domain validation fails", () => {
		mockSiweMessageConstructor.mockReturnValue(createMockMessage({ domain: "evil.com" }));

		expect(() => parseAndValidateSiweMessage("any-message", { siweConfig: SIWE_CONFIG })).toThrow("domain mismatch");
	});

	it("should throw if URI validation fails", () => {
		mockSiweMessageConstructor.mockReturnValue(createMockMessage({ uri: "https://evil.com" }));

		expect(() => parseAndValidateSiweMessage("any-message", { siweConfig: SIWE_CONFIG })).toThrow("uri mismatch");
	});

	it("should throw if chain ID validation fails", () => {
		mockSiweMessageConstructor.mockReturnValue(createMockMessage({ chainId: 1 }));

		expect(() => parseAndValidateSiweMessage("any-message", { siweConfig: SIWE_CONFIG })).toThrow(
			"unsupported chain ID",
		);
	});

	it("should throw if message has expired", () => {
		mockSiweMessageConstructor.mockReturnValue(
			createMockMessage({ expirationTime: new Date(Date.now() - 60_000).toISOString() }),
		);

		expect(() => parseAndValidateSiweMessage("any-message", { siweConfig: SIWE_CONFIG })).toThrow(
			"message has expired",
		);
	});

	it("should throw if nonce is too short", () => {
		mockSiweMessageConstructor.mockReturnValue(createMockMessage({ nonce: "AB" }));

		expect(() => parseAndValidateSiweMessage("any-message", { siweConfig: SIWE_CONFIG })).toThrow(
			"nonce is missing or too short",
		);
	});
});
