import { Injectable } from "@nestjs/common";
import { UserRow, usersTable } from "@db/schema/users-table";
import { kycTable } from "@db/schema/kyc-table";
import { eq } from "drizzle-orm";
import { DrizzleService } from "@core/database/drizzle.service";
import { UserAlreadyExistsException } from "@shared/exceptions/user-already-exists.exception";
import { SiweVerifierService } from "@modules/auth/verification/siwe-verifier.service";
import { CreateUserOutputDto } from "./dto/create-user-output.dto";

@Injectable()
export class UsersService {
	constructor(
		private readonly drizzleService: DrizzleService,
		private readonly siweVerifierService: SiweVerifierService,
	) {}

	public async getUserDatabaseRow(userId: string): Promise<UserRow | null> {
		const rows = await this.drizzleService.db.select().from(usersTable).where(eq(usersTable.id, userId));
		return rows[0] ?? null;
	}

	public async createUser(
		walletAddress: string,
		siweMessage: string,
		siweSignature: string,
	): Promise<CreateUserOutputDto> {
		await this.siweVerifierService.verify({
			expectedSignerWalletAddress: walletAddress,
			message: siweMessage,
			signature: siweSignature,
		});

		const normalizedWalletAddress = walletAddress.toLowerCase();
		const newUserId = this._generateUserId();

		try {
			const rows = await this.drizzleService.db
				.insert(usersTable)
				.values({
					id: newUserId,
					wallet_address: normalizedWalletAddress,
				})
				.returning();

			const insertedRow = rows[0];

			if (!insertedRow) throw new Error("User insert returned no rows");

			await this.drizzleService.db.insert(kycTable).values({
				id: crypto.randomUUID(),
				user_id: newUserId,
			});

			return CreateUserOutputDto.fromDatabaseRow(insertedRow);
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
}
