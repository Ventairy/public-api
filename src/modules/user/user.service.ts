import { Injectable } from "@nestjs/common";
import { UserRow } from "@db/schema/users-table";
import type { UserType } from "@shared/enums/user-type";
import { KycRepository } from "@modules/kyc/repositories/kyc.repository";
import { UserRepository } from "./repositories/user.repository";
import { UserAlreadyExistsException } from "@shared/exceptions/user-already-exists.exception";
import { CryptoUtils } from "@shared/utils";
import { SiweVerifierService } from "@modules/auth/verification/siwe-verifier.service";
import { JwtService } from "@modules/auth/jwt/jwt.service";
import { UserSessionRepository } from "@modules/auth/repositories/user-session.repository";
import { AtomicExecutionService } from "@core/database";
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
		private readonly _atomicExecutionService: AtomicExecutionService,
	) {}

	public async getUserDatabaseRow(userId: string): Promise<UserRow | null> {
		return this._userRepository.findById(userId);
	}

	public async createUser(params: {
		siweMessage: string;
		siweSignature: string;
		deviceInfo?: string;
		ipAddress?: string;
		userType: UserType;
	}): Promise<CreateUserResult> {
		const { walletAddress: siweWalletAddress, chainId: siweChainId } =
			await this._siweVerifierService.parseAndVerifyMessage({
				message: params.siweMessage,
				signature: params.siweSignature,
			});

		const newUserId = this._generateUserId();
		const rawRefreshToken = CryptoUtils.generateSecureRandom(REFRESH_TOKEN_BYTE_LENGTH);
		const refreshTokenHash = CryptoUtils.hashSha256(rawRefreshToken);
		const now = new Date();
		const expiresAt = new Date(now.getTime() + REFRESH_TOKEN_TTL_SECONDS * 1000).toISOString();

		try {
			const [[insertedRow, session]] = await Promise.all([
				this._atomicExecutionService.execute(
					this._userRepository.create_atomicCall({
						id: newUserId,
						wallet_address: siweWalletAddress,
						chain_id: siweChainId,
						user_type: params.userType,
					}),
					this._userSessionRepository.create_atomicCall({
						id: crypto.randomUUID(),
						user_id: newUserId,
						refresh_token_hash: refreshTokenHash,
						device_info: params.deviceInfo ?? null,
						ip_address: params.ipAddress ?? null,
						expires_at: expiresAt,
					}),
					this._kycRepository.create_atomicCall({
						id: crypto.randomUUID(),
						user_id: newUserId,
					}),
				),
				this._userSessionRepository.deleteExpired(),
			]);

			const accessToken = await this._jwtService.generateAccessToken({
				userId: newUserId,
				sessionId: session.id,
				userType: params.userType,
				walletAddress: siweWalletAddress,
				chainId: siweChainId,
			});

			return {
				user: CreateUserOutputDto.fromDatabaseRow(insertedRow),
				accessToken,
				rawRefreshToken,
			};
		} catch (error) {
			if (this._isUniqueViolation(error)) throw new UserAlreadyExistsException(siweWalletAddress);

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
