import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { SupportedBlockchain } from "@shared/blockchain";
export class NonceOutputDto {
	constructor(data: { nonce: string; expiresAt: string; walletAddress: string; chainId: SupportedBlockchain }) {
		this.nonce = data.nonce;
		this.expiresAt = data.expiresAt;
		this.walletAddress = data.walletAddress;
		this.chainId = data.chainId;
	}

	@ApiProperty({
		name: "nonce",
		description: "Single-use cryptographic nonce for SIWE message signing.",
		example: "ABCD2345EFGH6789",
	})
	@Expose({ name: "nonce" })
	nonce: string;
	@ApiProperty({
		name: "expires_at",
		description: "ISO-8601 timestamp when this nonce expires.",
		format: "date-time",
		example: "2026-05-04T14:51:00.000Z",
	})
	@Expose({ name: "expires_at" })
	expiresAt: string;
	@ApiProperty({
		name: "wallet_address",
		description: "Wallet address this nonce is bound to.",
		example: "0x742d35cc6634c0532925a3b844bc9e7595f0beb1",
	})
	@Expose({ name: "wallet_address" })
	walletAddress: string;
	@ApiProperty({
		name: "chain_id",
		description: "Blockchain chain ID this nonce is bound to. Must match the chain_id in the SIWE message signature.",
		enum: SupportedBlockchain,
		example: SupportedBlockchain.BASE,
	})
	@Expose({ name: "chain_id" })
	chainId: SupportedBlockchain;
}
