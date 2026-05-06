import { ApiProperty } from "@nestjs/swagger";

export class NonceOutputDto {
	@ApiProperty({
		description: "Single-use cryptographic nonce for SIWE message signing.",
		example: "ABCD2345EFGH6789",
	})
	nonce!: string;

	@ApiProperty({
		description: "ISO-8601 timestamp when this nonce expires.",
		format: "date-time",
		example: "2026-05-04T14:51:00.000Z",
	})
	expires_at!: string;

	@ApiProperty({
		description: "Wallet address this nonce is bound to.",
		example: "0x742d35cc6634c0532925a3b844bc9e7595f0beb1",
	})
	wallet_address!: string;
}
