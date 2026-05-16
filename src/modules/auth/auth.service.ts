import { Injectable, UnauthorizedException, ForbiddenException } from "@nestjs/common";
import type { Request } from "express";
import { CryptoUtils } from "@shared/utils/crypto.utils";
import { UserType } from "@shared/enums/user-type";
import { UserRepository } from "@modules/user/repositories/user.repository";
import { VerificationRepository } from "@modules/verification/repositories/verification.repository";
import { SiweVerifierService } from "./verification/siwe-verifier.service";
import { JwtService } from "./jwt/jwt.service";
import { UserSessionRepository } from "./repositories/user-session.repository";
import { AtomicExecutionService } from "@core/database";
import { REFRESH_TOKEN_TTL_SECONDS, REFRESH_TOKEN_BYTE_LENGTH, REFRESH_COOKIE_NAME } from "./constants/token.constants";
import { CookieUtils } from "./utils/cookie.utils";
import { LoginOutputDto } from "./dto/login-output.dto";
import { RegisterOutputDto } from "./dto/register-output.dto";
import { RefreshTokensOutputDto } from "./dto/refresh-tokens-output.dto";
import { SessionOutputDto, SessionsListOutputDto } from "./dto/session-output.dto";
import { SessionExpiredException } from "@shared/exceptions/session-expired.exception";
import { SessionNotFoundException } from "@shared/exceptions/session-not-found.exception";
import { UserNotFoundException } from "@shared/exceptions/user-not-found.exception";
import { UserAlreadyExistsException } from "@shared/exceptions/user-already-exists.exception";

@Injectable()
export class AuthService {
	constructor(
		private readonly _siweVerifierService: SiweVerifierService,
		private readonly _userRepository: UserRepository,
		private readonly _jwtService: JwtService,
		private readonly _userSessionRepository: UserSessionRepository,
		private readonly _verificationRepository: VerificationRepository,
		private readonly _atomicExecutionService: AtomicExecutionService,
	) {}

	public async register(params: {
		siweMessage: string;
		siweSignature: string;
		deviceInfo?: string;
		ipAddress?: string;
		userType: UserType;
	}): Promise<{ user: RegisterOutputDto; accessToken: string; rawRefreshToken: string }> {
		const { walletAddress, chainId } = await this._siweVerifierService.parseAndVerifyMessage({
			message: params.siweMessage,
			signature: params.siweSignature,
		});

		const newUserId = crypto.randomUUID();
		const rawRefreshToken = CryptoUtils.generateSecureRandom(REFRESH_TOKEN_BYTE_LENGTH);
		const refreshTokenHash = CryptoUtils.hashSha256(rawRefreshToken);
		const now = new Date();
		const expiresAt = new Date(now.getTime() + REFRESH_TOKEN_TTL_SECONDS * 1000).toISOString();

		try {
			const [[userRow, verificationRow, session]] = await Promise.all([
				this._atomicExecutionService.execute(
					this._userRepository.create_atomicCall({
						id: newUserId,
						wallet_address: walletAddress,
						chain_id: chainId,
						user_type: params.userType,
					}),
					this._verificationRepository.create_atomicCall({
						id: crypto.randomUUID(),
						user_id: newUserId,
					}),
					this._userSessionRepository.create_atomicCall({
						id: crypto.randomUUID(),
						user_id: newUserId,
						refresh_token_hash: refreshTokenHash,
						device_info: params.deviceInfo ?? null,
						ip_address: params.ipAddress ?? null,
						expires_at: expiresAt,
					}),
				),
				this._userSessionRepository.deleteExpired(),
			]);

			const accessToken = await this._jwtService.generateAccessToken({
				userId: userRow.id,
				sessionId: session.id,
				userType: params.userType,
				walletAddress,
				chainId,
				verificationStatus: verificationRow.verification_status,
			});

			return {
				user: RegisterOutputDto.fromDatabaseRow(userRow),
				accessToken,
				rawRefreshToken,
			};
		} catch (error) {
			if (this._isUniqueUserViolation(error)) throw new UserAlreadyExistsException(walletAddress);

			throw error;
		}
	}

	public async login(params: {
		message: string;
		signature: string;
		deviceInfo?: string;
		ipAddress?: string;
	}): Promise<{ output: LoginOutputDto; accessToken: string; rawRefreshToken: string }> {
		const { walletAddress: siweWalletAddress } = await this._siweVerifierService.parseAndVerifyMessage({
			message: params.message,
			signature: params.signature,
		});

		const [user] = await Promise.all([this._userRepository.findByWalletAddress(siweWalletAddress), this._userSessionRepository.deleteExpired()]);

		if (!user) throw new UserNotFoundException(siweWalletAddress);

		const rawRefreshToken = CryptoUtils.generateSecureRandom(REFRESH_TOKEN_BYTE_LENGTH);
		const refreshTokenHash = CryptoUtils.hashSha256(rawRefreshToken);
		const now = new Date();
		const expiresAt = new Date(now.getTime() + REFRESH_TOKEN_TTL_SECONDS * 1000).toISOString();

		const [session, verificationStatus] = await Promise.all([
			this._userSessionRepository.create({
				id: crypto.randomUUID(),
				user_id: user.id,
				refresh_token_hash: refreshTokenHash,
				device_info: params.deviceInfo ?? null,
				ip_address: params.ipAddress ?? null,
				expires_at: expiresAt,
			}),
			this._verificationRepository.getVerificationStatus(user.id),
		]);

		const accessToken = await this._jwtService.generateAccessToken({
			userId: user.id,
			sessionId: session.id,
			userType: user.user_type,
			walletAddress: user.wallet_address,
			chainId: user.chain_id,
			verificationStatus,
		});

		return {
			output: new LoginOutputDto({ expiresAt }),
			accessToken,
			rawRefreshToken,
		};
	}

	public async refreshTokens(request: Request): Promise<{
		output: RefreshTokensOutputDto;
		accessToken: string;
		newRawRefreshToken: string;
	}> {
		const rawRefreshToken = CookieUtils.extractCookie(request, REFRESH_COOKIE_NAME);
		if (!rawRefreshToken) throw new UnauthorizedException("Refresh token is missing");

		const refreshTokenHash = CryptoUtils.hashSha256(rawRefreshToken);
		const currentSession = await this._userSessionRepository.findByRefreshTokenHash(refreshTokenHash);
		if (!currentSession) throw new UnauthorizedException("Refresh token is invalid or session has been revoked");

		const now = new Date();

		if (now.toISOString() > currentSession.expires_at) {
			await this._userSessionRepository.deleteExpired();
			throw new SessionExpiredException();
		}

		const newRawRefreshToken = CryptoUtils.generateSecureRandom(REFRESH_TOKEN_BYTE_LENGTH);
		const newHash = CryptoUtils.hashSha256(newRawRefreshToken);
		const newExpiresAt = new Date(now.getTime() + REFRESH_TOKEN_TTL_SECONDS * 1000).toISOString();

		const [user, , verificationStatus] = await Promise.all([
			this._userRepository.findById(currentSession.user_id),
			this._userSessionRepository.updateRefreshTokenHash({
				id: currentSession.id,
				refreshTokenHash: newHash,
				expiresAt: newExpiresAt,
				updatedAt: now.toISOString(),
			}),
			this._verificationRepository.getVerificationStatus(currentSession.user_id),
		]);

		if (!user) throw new UserNotFoundException(currentSession.user_id);

		const accessToken = await this._jwtService.generateAccessToken({
			userId: currentSession.user_id,
			sessionId: currentSession.id,
			userType: user.user_type,
			walletAddress: user.wallet_address,
			chainId: user.chain_id,
			verificationStatus,
		});

		return {
			output: new RefreshTokensOutputDto({ expiresAt: newExpiresAt }),
			accessToken,
			newRawRefreshToken,
		};
	}

	public async logout(request: Request): Promise<void> {
		const rawRefreshToken = CookieUtils.extractCookie(request, "__Host-ventairy-refresh");
		if (!rawRefreshToken) return;

		const refreshTokenHash = CryptoUtils.hashSha256(rawRefreshToken);
		const session = await this._userSessionRepository.findByRefreshTokenHash(refreshTokenHash);
		if (session) await this._userSessionRepository.deleteById(session.id);
	}

	public async listSessions(userId: string, currentSessionId: string): Promise<SessionsListOutputDto> {
		const sessions = await this._userSessionRepository.findByUserId(userId);

		const now = new Date();
		const sessionDtos = sessions.filter((s) => s.expires_at > now.toISOString()).map((s) => SessionOutputDto.fromDatabaseRow(s, currentSessionId));

		return new SessionsListOutputDto({ sessions: sessionDtos });
	}

	public async revokeSession(params: { sessionId: string; userId: string; currentSessionId: string }): Promise<{ isCurrentSession: boolean }> {
		const session = await this._userSessionRepository.findById(params.sessionId);
		if (!session) throw new SessionNotFoundException(params.sessionId);
		if (session.user_id !== params.userId) throw new ForbiddenException("Session does not belong to the current user");

		await this._userSessionRepository.deleteById(params.sessionId);

		return { isCurrentSession: session.id === params.currentSessionId };
	}

	public async logoutOthers(userId: string, currentSessionId: string): Promise<void> {
		const sessions = await this._userSessionRepository.findByUserId(userId);

		const sessionsToDelete = sessions.filter((s) => s.id !== currentSessionId);

		await Promise.all(sessionsToDelete.map((s) => this._userSessionRepository.deleteById(s.id)));
	}

	private _isUniqueUserViolation(error: unknown): boolean {
		const message = error instanceof Error ? `${error.message} ${error.cause instanceof Error ? error.cause.message : ""}` : String(error);

		return message.includes("UNIQUE constraint failed") && message.includes("wallet_address");
	}
}
