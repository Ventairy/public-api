import { Injectable } from "@nestjs/common";
import { usersTable, type UserRow } from "@db/schema/users-table";
import { DrizzleService } from "@core/database/drizzle.service";
import { VENTAIRY_KYC_STATUS } from "@shared/constants/ventairy-kyc-status";
import { UserAlreadyExistsException } from "@shared/exceptions/user-already-exists.exception";
import { CreateUserOutputDto } from "./dto/create-user-output.dto";

@Injectable()
export class UsersService {
	constructor(private readonly drizzleService: DrizzleService) {}

	public async createUser(walletAddress: string): Promise<CreateUserOutputDto> {
		const normalizedWalletAddress = walletAddress.toLowerCase();
		const newUserId = this._generateUserId();

		try {
			const rows = await this.drizzleService.db
				.insert(usersTable)
				.values({
					id: newUserId,
					wallet_address: normalizedWalletAddress,
					ventairy_kyc_status: VENTAIRY_KYC_STATUS.PENDING,
				})
				.returning();

			const insertedRow = rows[0];

			if (!insertedRow) throw new Error("User insert returned no rows");

			return this._toResponse(insertedRow);
		} catch (error) {
			if (this._isUniqueViolation(error)) throw new UserAlreadyExistsException(normalizedWalletAddress);

			throw error;
		}
	}

	private _generateUserId(): string {
		return crypto.randomUUID();
	}

	private _isUniqueViolation(error: unknown): boolean {
		const message =
			error instanceof Error
				? `${error.message} ${error.cause instanceof Error ? error.cause.message : ""}`
				: String(error);

		return message.includes("UNIQUE constraint failed") && message.includes("wallet_address");
	}

	private _toResponse(row: UserRow): CreateUserOutputDto {
		return {
			id: row.id,
			wallet_address: row.wallet_address,
			ventairy_kyc_status: row.ventairy_kyc_status,
			created_at: row.created_at,
			updated_at: row.updated_at,
		};
	}
}
