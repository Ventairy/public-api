import { Injectable } from "@nestjs/common";
import { UserRow } from "@db/schema/users-table";
import type { UserType } from "@shared/enums/user-type";
import { KycRepository } from "@modules/kyc/repositories/kyc.repository";
import { UserRepository } from "./repositories/user.repository";
import { UserAlreadyExistsException } from "@shared/exceptions/user-already-exists.exception";
import { CryptoUtils } from "@shared/utils/crypto.utils";
import { SiweVerifierService } from "@modules/auth/verification/siwe-verifier.service";
import { JwtService } from "@modules/auth/jwt/jwt.service";
import { UserSessionRepository } from "@modules/auth/repositories/user-session.repository";
import { REFRESH_TOKEN_TTL_SECONDS, REFRESH_TOKEN_BYTE_LENGTH } from "@modules/auth/constants/token.constants";
import { CreateUserOutputDto } from "./dto/create-user-output.dto";

export interface CreateUserResult {
	user: CreateUserOutputDto;
	accessToken: string;
	rawRefreshToken: string;
}

@Injectable()
export class UserService {
	constructor(
		private readonly _userRepository: UserRepository,
		private readonly _kycRepository: KycRepository,
		private readonly _siweVerifierService: SiweVerifierService,
		private readonly _jwtService: JwtService,
		private readonly _userSessionRepository: UserSessionRepository,
	) {}

	public async getUserDatabaseRow(userId: string): Promise<UserRow | null> {
		return this._userRepository.findById(userId);
	}

	public async createUser(params: {
		walletAddress: string;
		siweMessage: string;
		siweSignature: string;
		deviceInfo?: string;
		ipAddress?: string;
		userType: UserType;
	}): Promise<CreateUserResult> {
		await this._siweVerifierService.verify({
			expectedSignerWalletAddress: params.walletAddress,
			message: params.siweMessage,
			signature: params.siweSignature,
		});

		const normalizedWalletAddress = params.walletAddress.toLowerCase();
		const newUserId = this._generateUserId();

		try {
			const insertedRow = await this._userRepository.create({
				id: newUserId,
				wallet_address: normalizedWalletAddress,
				user_type: params.userType,
			});

			await this._kycRepository.create({
				id: crypto.randomUUID(),
				user_id: newUserId,
			});

			const rawRefreshToken = CryptoUtils.generateSecureRandom(REFRESH_TOKEN_BYTE_LENGTH);
			const refreshTokenHash = CryptoUtils.hashSha256(rawRefreshToken);
			const now = new Date();
			const expiresAt = new Date(now.getTime() + REFRESH_TOKEN_TTL_SECONDS * 1000).toISOString();

			const [session] = await Promise.all([
				this._userSessionRepository.create({
					id: crypto.randomUUID(),
					user_id: newUserId,
					refresh_token_hash: refreshTokenHash,
					device_info: params.deviceInfo ?? null,
					ip_address: params.ipAddress ?? null,
					expires_at: expiresAt,
				}),
				this._userSessionRepository.deleteExpired(),
			]);

			const accessToken = await this._jwtService.generateAccessToken({
				userId: newUserId,
				sessionId: session.id,
				userType: params.userType,
			});

			return {
				user: CreateUserOutputDto.fromDatabaseRow(insertedRow),
				accessToken,
				rawRefreshToken,
			};
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
