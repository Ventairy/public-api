import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform, Type } from "class-transformer";
import { IsDefined, IsEthereumAddress, IsString, ValidateNested } from "class-validator";
import { SiweVerificationInputDto } from "@modules/auth/dto/siwe-verification-input.dto";

export class CreateUserInputDto {
	@ApiProperty({
		name: "wallet_address",
		description:
			"EVM-compatible wallet address that will own this Ventairy user account. Must be a valid Ethereum address (0x-prefixed 40-character hexadecimal string).",
		example: "0x742d35Cc6634C0532925a3b844Bc9e7595f0BEb1",
		pattern: "^0x[a-fA-F0-9]{40}$",
	})
	@Expose({ name: "wallet_address" })
	@IsString()
	@IsEthereumAddress()
	@Transform(({ value }) => (typeof value === "string" ? value.toLowerCase() : value))
	walletAddress!: string;

	@ApiProperty({
		name: "siwe",
		description: "ERC-4361 (SIWE) message and signature proving wallet ownership.",
		type: SiweVerificationInputDto,
	})
	@Expose({ name: "siwe" })
	@IsDefined()
	@ValidateNested()
	@Type(() => SiweVerificationInputDto)
	siwe!: SiweVerificationInputDto;
}

