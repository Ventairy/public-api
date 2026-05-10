import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsEthereumAddress, IsString } from "class-validator";

export class NonceInputDto {
	@ApiProperty({
		name: "wallet_address",
		description: "EVM-compatible wallet address requesting a SIWE nonce.",
		example: "0x742d35Cc6634C0532925a3b844Bc9e7595f0BEb1",
		pattern: "^0x[a-fA-F0-9]{40}$",
	})
	@Expose({ name: "wallet_address" })
	@IsString()
	@IsEthereumAddress()
	walletAddress!: string;
}
