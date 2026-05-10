import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsHexadecimal, IsString, Length } from "class-validator";

export class SiweVerificationInputDto {
	@ApiProperty({
		name: "message",
		description: "The raw ERC-4361 (SIWE) message string signed by the wallet.",
		type: String,
	})
	@Expose({ name: "message" })
	@IsString()
	message!: string;

	@ApiProperty({
		name: "signature",
		description: "The hex-encoded ECDSA signature produced by signing the SIWE message.",
		example: "0x1a2b3c...",
		pattern: "^0x[0-9a-fA-F]{130}$",
	})
	@Expose({ name: "signature" })
	@IsString()
	@IsHexadecimal()
	@Length(132, 132)
	signature!: string;
}
