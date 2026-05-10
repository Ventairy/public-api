import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { UserSessionRow } from "@db/schema/user-sessions-table";

export class SessionOutputDto {
	constructor(data: {
		id: string;
		deviceInfo: string | null;
		ipAddress: string | null;
		createdAt: string;
		updatedAt: string;
		expiresAt: string;
		isCurrent: boolean;
	}) {
		this.id = data.id;
		this.deviceInfo = data.deviceInfo;
		this.ipAddress = data.ipAddress;
		this.createdAt = data.createdAt;
		this.updatedAt = data.updatedAt;
		this.expiresAt = data.expiresAt;
		this.isCurrent = data.isCurrent;
	}

	static fromDatabaseRow(row: UserSessionRow, currentSessionId: string): SessionOutputDto {
		return new SessionOutputDto({
			id: row.id,
			deviceInfo: row.device_info ?? null,
			ipAddress: row.ip_address ?? null,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
			expiresAt: row.expires_at,
			isCurrent: row.id === currentSessionId,
		});
	}

	@ApiProperty({ name: "id", description: "Session unique identifier." })
	@Expose({ name: "id" })
	id: string;

	@ApiProperty({ name: "device_info", description: "User-Agent string from the session creation." })
	@Expose({ name: "device_info" })
	deviceInfo: string | null;

	@ApiProperty({ name: "ip_address", description: "IP address from the session creation." })
	@Expose({ name: "ip_address" })
	ipAddress: string | null;

	@ApiProperty({ name: "created_at", description: "ISO-8601 session creation timestamp." })
	@Expose({ name: "created_at" })
	createdAt: string;

	@ApiProperty({ name: "updated_at", description: "ISO-8601 last rotation timestamp." })
	@Expose({ name: "updated_at" })
	updatedAt: string;

	@ApiProperty({ name: "expires_at", description: "ISO-8601 session expiration timestamp." })
	@Expose({ name: "expires_at" })
	expiresAt: string;

	@ApiProperty({
		name: "is_current",
		description: "Whether this session is the current session of the authenticated user.",
	})
	@Expose({ name: "is_current" })
	isCurrent: boolean;
}

export class SessionsListOutputDto {
	constructor(data: { sessions: SessionOutputDto[] }) {
		this.sessions = data.sessions;
	}

	@ApiProperty({
		name: "sessions",
		description: "List of active sessions for the authenticated user.",
		type: [SessionOutputDto],
	})
	@Expose({ name: "sessions" })
	sessions: SessionOutputDto[];
}
