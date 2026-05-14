import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsEthereumAddress, IsEnum, IsString } from "class-validator";
import { SupportedBlockchain } from "@shared/blockchain";

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

	@ApiProperty({
		name: "chain_id",
		description: "The blockchain chain ID the nonce is being created for. Must match the chain_id in the SIWE message signature to ensure the signed chain matches the intended chain.",
		enum: SupportedBlockchain,
		example: SupportedBlockchain.BASE,
	})
	@Expose({ name: "chain_id" })
	@IsEnum(SupportedBlockchain)
	chainId!: SupportedBlockchain;
}
