import { describe, it, expect } from "vitest";
import { instanceToPlain } from "class-transformer";
import { RefreshTokensOutputDto } from "../refresh-tokens-output.dto";

describe("RefreshOutputDto", () => {
	it("should expose expires_at in snake_case", () => {
		const dto = new RefreshTokensOutputDto({ expiresAt: "2026-01-08T00:00:00.000Z" });

		const plain = instanceToPlain(dto);

		expect(plain).toEqual({ expires_at: "2026-01-08T00:00:00.000Z" });
	});
});
