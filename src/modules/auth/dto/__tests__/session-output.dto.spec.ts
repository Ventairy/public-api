import { describe, it, expect } from "vitest";
import { instanceToPlain } from "class-transformer";
import { UserSessionRow } from "@db/schema/user-sessions-table";
import { SessionOutputDto, SessionsListOutputDto } from "../session-output.dto";

describe("SessionOutputDto", () => {
	it("should expose properties in snake_case", () => {
		const dto = new SessionOutputDto({
			id: "s-1",
			deviceInfo: "Mozilla/5.0",
			ipAddress: "127.0.0.1",
			createdAt: "2026-01-01T00:00:00.000Z",
			updatedAt: "2026-01-01T01:00:00.000Z",
			expiresAt: "2026-01-08T00:00:00.000Z",
			isCurrent: true,
		});

		const plain = instanceToPlain(dto);

		expect(plain).toEqual({
			id: "s-1",
			device_info: "Mozilla/5.0",
			ip_address: "127.0.0.1",
			created_at: "2026-01-01T00:00:00.000Z",
			updated_at: "2026-01-01T01:00:00.000Z",
			expires_at: "2026-01-08T00:00:00.000Z",
			is_current: true,
		});
	});

	it("fromDatabaseRow should map row with isCurrent=false for non-matching session", () => {
		const row: UserSessionRow = {
			id: "s-1",
			user_id: "u-1",
			refresh_token_hash: "abc123",
			device_info: "Mozilla/5.0",
			ip_address: "127.0.0.1",
			created_at: "2026-01-01T00:00:00.000Z",
			updated_at: "2026-01-01T01:00:00.000Z",
			expires_at: "2026-01-08T00:00:00.000Z",
		};

		const dto = SessionOutputDto.fromDatabaseRow(row, "other-session");

		expect(dto.id).toBe("s-1");
		expect(dto.deviceInfo).toBe("Mozilla/5.0");
		expect(dto.ipAddress).toBe("127.0.0.1");
		expect(dto.createdAt).toBe("2026-01-01T00:00:00.000Z");
		expect(dto.updatedAt).toBe("2026-01-01T01:00:00.000Z");
		expect(dto.expiresAt).toBe("2026-01-08T00:00:00.000Z");
		expect(dto.isCurrent).toBe(false);
	});

	it("fromDatabaseRow should set isCurrent=true when session matches", () => {
		const row: UserSessionRow = {
			id: "s-1",
			user_id: "u-1",
			refresh_token_hash: "abc123",
			device_info: null,
			ip_address: null,
			created_at: "2026-01-01T00:00:00.000Z",
			updated_at: "2026-01-01T00:00:00.000Z",
			expires_at: "2026-01-08T00:00:00.000Z",
		};

		const dto = SessionOutputDto.fromDatabaseRow(row, "s-1");

		expect(dto.isCurrent).toBe(true);
	});
});

describe("SessionsListOutputDto", () => {
	it("should expose sessions array in snake_case", () => {
		const session = new SessionOutputDto({
			id: "s-1",
			deviceInfo: null,
			ipAddress: null,
			createdAt: "2026-01-01T00:00:00.000Z",
			updatedAt: "2026-01-01T00:00:00.000Z",
			expiresAt: "2026-01-08T00:00:00.000Z",
			isCurrent: false,
		});
		const dto = new SessionsListOutputDto({ sessions: [session] });

		const plain = instanceToPlain(dto) as Record<string, unknown>;

		expect(plain).toHaveProperty("sessions");
		expect(Array.isArray(plain["sessions"])).toBe(true);
		expect(plain["sessions"]).toHaveLength(1);
	});
});
