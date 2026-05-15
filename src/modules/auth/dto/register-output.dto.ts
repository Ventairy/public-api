import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { VentairyKycStatus } from "@shared/enums/ventairy-kyc-status";
import { UserType } from "@shared/enums/user-type";
import { type UserRow } from "@db/schema/users-table";
import { SupportedBlockchain } from "@shared/blockchain";

export class RegisterOutputDto {
	static fromDatabaseRow(row: UserRow): RegisterOutputDto {
		return new RegisterOutputDto({
			id: row.id,
			walletAddress: row.wallet_address,
			chainId: row.chain_id,
			userType: row.user_type,
			ventairyKycStatus: VentairyKycStatus.PENDING,
			createdAt: row.created_at,
		});
	}

	constructor(data: { id: string; walletAddress: string; chainId: SupportedBlockchain; userType: UserType; ventairyKycStatus: VentairyKycStatus; createdAt: string }) {
		this.id = data.id;
		this.walletAddress = data.walletAddress;
		this.chainId = data.chainId;
		this.userType = data.userType;
		this.ventairyKycStatus = data.ventairyKycStatus;
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

	@ApiProperty({ name: "wallet_address", description: "Lowercased EVM wallet address associated with the user account.", example: "0x742d35cc6634c0532925a3b844bc9e7595f0beb1" })
	@Expose({ name: "wallet_address" })
	walletAddress: string;

	@ApiProperty({
		name: "chain_id",
		description: "The blockchain network (chain ID) where the user's wallet operates.",
		enum: SupportedBlockchain,
		example: SupportedBlockchain.BASE,
	})
	@Expose({ name: "chain_id" })
	chainId: SupportedBlockchain;

	@ApiProperty({ name: "user_type", description: "Type of user account.", enum: UserType, example: UserType.BUSINESS })
	@Expose({ name: "user_type" })
	userType: UserType;

	@ApiProperty({
		name: "ventairy_kyc_status",
		description: "Current Ventairy KYC review status. New users always start as PENDING.",
		enum: Object.values(VentairyKycStatus),
		example: VentairyKycStatus.PENDING,
	})
	@Expose({ name: "ventairy_kyc_status" })
	ventairyKycStatus: VentairyKycStatus;

	@ApiProperty({ name: "created_at", description: "ISO-8601 timestamp marking when the user was created.", format: "date-time", example: "2026-05-04T14:48:00.000Z" })
	@Expose({ name: "created_at" })
	createdAt: string;
}
