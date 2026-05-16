import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { VerificationStatus } from "@shared/enums/verification-status";
import { UserType } from "@shared/enums/user-type";
import { type UserRow } from "@db/schema/users-table";
import { SupportedBlockchain } from "@shared/blockchain";

export class CreateUserOutputDto {
	static fromDatabaseRow(row: UserRow): CreateUserOutputDto {
		return new CreateUserOutputDto({
			id: row.id,
			walletAddress: row.wallet_address,
			chainId: row.chain_id,
			userType: row.user_type,
			verificationStatus: VerificationStatus.PENDING,
			createdAt: row.created_at,
		});
	}

	constructor(data: { id: string; walletAddress: string; chainId: SupportedBlockchain; userType: UserType; verificationStatus: VerificationStatus; createdAt: string }) {
		this.id = data.id;
		this.walletAddress = data.walletAddress;
		this.chainId = data.chainId;
		this.userType = data.userType;
		this.verificationStatus = data.verificationStatus;
		this.createdAt = data.createdAt;
	}

	@ApiProperty({
		name: "id",
		description: "Ventairy-issued unique identifier for the user. UUID v4 generated server-side.",
		format: "uuid",
		example: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
	})
	@Expose({ name: "id" })
	id: string;

	@ApiProperty({
		name: "wallet_address",
		description: "Lowercased EVM wallet address associated with the user account. Used as the receiving wallet for stablecoin settlements.",
		example: "0x742d35cc6634c0532925a3b844bc9e7595f0beb1",
	})
	@Expose({ name: "wallet_address" })
	walletAddress: string;

	@ApiProperty({
		name: "chain_id",
		description: "The blockchain network (chain ID) where the user's wallet operates. Used for settlement routing",
		enum: SupportedBlockchain,
		example: SupportedBlockchain.BASE,
	})
	@Expose({ name: "chain_id" })
	chainId: SupportedBlockchain;

	@ApiProperty({
		name: "user_type",
		description: "Type of user account. Determines feature access and requirements.",
		enum: UserType,
		example: UserType.BUSINESS,
	})
	@Expose({ name: "user_type" })
	userType: UserType;

	@ApiProperty({
		name: "verification_status",
		description: "Current Ventairy KYC review status. PENDING = not submitted, VERIFYING = under review, APPROVED = cleared, REJECTED = denied. New users always start as PENDING.",
		enum: Object.values(VerificationStatus),
		example: VerificationStatus.PENDING,
	})
	@Expose({ name: "verification_status" })
	verificationStatus: VerificationStatus;

	@ApiProperty({
		name: "created_at",
		description: "ISO-8601 timestamp marking when the user was created.",
		format: "date-time",
		example: "2026-05-04T14:48:00.000Z",
	})
	@Expose({ name: "created_at" })
	createdAt: string;
}
