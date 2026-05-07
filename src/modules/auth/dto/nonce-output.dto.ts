import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class NonceOutputDto {
	@ApiProperty({
		name: "nonce",
		description: "Single-use cryptographic nonce for SIWE message signing.",
		example: "ABCD2345EFGH6789",
	})
	@Expose({ name: "nonce" })
	nonce!: string;

	@ApiProperty({
		name: "expires_at",
		description: "ISO-8601 timestamp when this nonce expires.",
		format: "date-time",
		example: "2026-05-04T14:51:00.000Z",
	})
	@Expose({ name: "expires_at" })
	expiresAt!: string;

	@ApiProperty({
		name: "wallet_address",
		description: "Wallet address this nonce is bound to.",
		example: "0x742d35cc6634c0532925a3b844bc9e7595f0beb1",
	})
	@Expose({ name: "wallet_address" })
	walletAddress!: string;
}

