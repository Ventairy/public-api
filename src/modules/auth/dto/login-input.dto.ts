import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { IsDefined, ValidateNested } from "class-validator";
import { SiweVerificationInputDto } from "./siwe-verification-input.dto";

export class LoginInputDto {
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
