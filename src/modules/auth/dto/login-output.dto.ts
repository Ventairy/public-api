import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class LoginOutputDto {
	constructor(data: { expiresAt: string }) {
		this.expiresAt = data.expiresAt;
	}

	@ApiProperty({
		name: "expires_at",
		description: "ISO-8601 timestamp when the refresh token expires.",
		format: "date-time",
		example: "2026-05-11T18:08:00.000Z",
	})
	@Expose({ name: "expires_at" })
	expiresAt: string;
}
