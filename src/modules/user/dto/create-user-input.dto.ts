import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { IsDefined, IsEnum, ValidateNested } from "class-validator";
import { SiweVerificationInputDto } from "@modules/auth/dto/siwe-verification-input.dto";
import { UserType } from "@shared/enums/user-type";

export class CreateUserInputDto {
	@ApiProperty({
		name: "user_type",
		description:
			"Type of user account. Determines feature access and requirements. Currently only 'BUSINESS' is supported.",
		enum: UserType,
		example: UserType.BUSINESS,
	})
	@Expose({ name: "user_type" })
	@IsEnum(UserType)
	userType!: UserType;

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
