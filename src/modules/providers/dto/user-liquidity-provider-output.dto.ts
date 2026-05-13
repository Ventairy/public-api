import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";

import type { UserLiquidityProviderRow } from "@db/schema/user-liquidity-providers-table";
import { LiquidityProviderId } from "@shared/enums/liquidity-provider-id";
import { UserLiquidityProviderStatus } from "@shared/enums/user-liquidity-provider-status";

export class UserLiquidityProviderOutputDto {
	static fromDatabaseRow(row: UserLiquidityProviderRow): UserLiquidityProviderOutputDto {
		return new UserLiquidityProviderOutputDto({
			userId: row.user_id,
			liquidityProviderId: row.liquidity_provider_id,
			liquidityProviderUserId: row.liquidity_provider_user_id,
			status: row.status,
		});
	}

	constructor(data: {
		userId: string;
		liquidityProviderId: LiquidityProviderId;
		liquidityProviderUserId: string | null;
		status: UserLiquidityProviderStatus;
	}) {
		this.userId = data.userId;
		this.liquidityProviderId = data.liquidityProviderId;
		this.liquidityProviderUserId = data.liquidityProviderUserId;
		this.status = data.status;
	}

	@ApiProperty({
		name: "user_id",
		description: "Ventairy user ID that this liquidity provider assignment belongs to.",
		format: "uuid",
		example: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
	})
	@Expose({ name: "user_id" })
	userId: string;

	@ApiProperty({
		name: "liquidity_provider_id",
		description: "The id of the liquidity provider that the user has access to.",
		enum: LiquidityProviderId,
		example: LiquidityProviderId.BLINDPAY,
	})
	@Expose({ name: "liquidity_provider_id" })
	liquidityProviderId: LiquidityProviderId;

	@ApiPropertyOptional({
		name: "liquidity_provider_user_id",
		description:
			"The user's unique identifier within the liquidity provider's system. Assigned by the liquidity provider during their KYC/onboarding process. Null until the provider has onboarded the user and provided an ID.",
		example: "lp_user_abc123",
	})
	@Expose({ name: "liquidity_provider_user_id" })
	liquidityProviderUserId: string | null;

	@ApiProperty({
		name: "status",
		description:
			"Current status of the user's access to this liquidity provider based on the user and provider relationship.",
		enum: UserLiquidityProviderStatus,
		example: UserLiquidityProviderStatus.ACTIVE,
	})
	@Expose({ name: "status" })
	status: UserLiquidityProviderStatus;
}
