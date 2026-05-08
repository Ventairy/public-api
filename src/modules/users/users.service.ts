import { Injectable } from "@nestjs/common";
import { UserRow } from "@db/schema/users-table";
import { KycRepository } from "@modules/kyc/repositories/kyc.repository";
import { UserRepository } from "./repositories/user.repository";
import { UserAlreadyExistsException } from "@shared/exceptions/user-already-exists.exception";
import { SiweVerifierService } from "@modules/auth/verification/siwe-verifier.service";
import { CreateUserOutputDto } from "./dto/create-user-output.dto";

@Injectable()
export class UsersService {
	constructor(
		private readonly _userRepository: UserRepository,
		private readonly _kycRepository: KycRepository,
		private readonly siweVerifierService: SiweVerifierService,
	) {}

	public async getUserDatabaseRow(userId: string): Promise<UserRow | null> {
		return this._userRepository.findById(userId);
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
			const insertedRow = await this._userRepository.create({
				id: newUserId,
				wallet_address: normalizedWalletAddress,
			});

			await this._kycRepository.create({
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
