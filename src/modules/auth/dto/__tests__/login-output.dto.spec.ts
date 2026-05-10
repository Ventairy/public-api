import { describe, it, expect } from "vitest";
import { instanceToPlain } from "class-transformer";
import { LoginOutputDto } from "../login-output.dto";

describe("LoginOutputDto", () => {
	it("should expose expires_at in snake_case", () => {
		const dto = new LoginOutputDto({ expiresAt: "2026-01-08T00:00:00.000Z" });

		const plain = instanceToPlain(dto);

		expect(plain).toEqual({ expires_at: "2026-01-08T00:00:00.000Z" });
	});

	it("should construct with expiresAt property", () => {
		const dto = new LoginOutputDto({ expiresAt: "2026-01-08T00:00:00.000Z" });

		expect(dto.expiresAt).toBe("2026-01-08T00:00:00.000Z");
	});
});
