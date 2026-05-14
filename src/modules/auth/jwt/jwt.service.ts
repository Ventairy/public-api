import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { JWT_CONFIG_KEY, type JwtConfig } from "@core/config";
import type { UserType } from "@shared/enums/user-type";
import type { VentairyKycStatus } from "@shared/enums";
import { ACCESS_TOKEN_TTL_SECONDS } from "../constants/token.constants";
import type { IAccessTokenPayload } from "./interfaces/access-token-payload.interface";
import { SupportedBlockchain } from "@shared/blockchain";

@Injectable()
export class JwtService {
	private readonly _secret: Uint8Array;

	constructor(private readonly _configService: ConfigService) {
		const config = this._configService.get<JwtConfig>(JWT_CONFIG_KEY);
		if (!config) throw new Error("JWT configuration is missing");

		this._secret = new TextEncoder().encode(config.secret);
	}

	public async generateAccessToken(params: {
		userId: string;
		sessionId: string;
		userType: UserType;
		walletAddress: string;
		chainId: SupportedBlockchain;
		kycStatus: VentairyKycStatus;
	}): Promise<string> {
		const jwtPayload: JWTPayload & IAccessTokenPayload = {
			sub: params.userId,
			sid: params.sessionId,
			user_type: params.userType,
			wallet_address: params.walletAddress,
			chain_id: params.chainId,
			kyc_status: params.kycStatus,
		};

		const jwt = await new SignJWT(jwtPayload)
			.setProtectedHeader({ alg: "HS256" })
			.setIssuedAt()
			.setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
			.sign(this._secret);

		return jwt;
	}

	public async verifyAccessToken(token: string): Promise<IAccessTokenPayload & { iat: number; exp: number }> {
		try {
			const { payload } = await jwtVerify(token, this._secret, { algorithms: ["HS256"] });

			return {
				sub: this._getRequiredClaimString(payload, "sub"),
				sid: this._getRequiredClaimString(payload, "sid"),
				user_type: this._getRequiredClaimString(payload, "user_type") as UserType,
				wallet_address: this._getRequiredClaimString(payload, "wallet_address"),
				chain_id: Number(this._getRequiredClaimString(payload, "chain_id")),
				kyc_status: this._getRequiredClaimString(payload, "kyc_status") as VentairyKycStatus,
				iat: payload.iat ?? 0,
				exp: payload.exp ?? 0,
			};
		} catch (error) {
			if (error instanceof UnauthorizedException) throw error;
			throw new UnauthorizedException("Invalid or expired access token");
		}
	}

	private _getRequiredClaimString(payload: JWTPayload, claim: keyof IAccessTokenPayload): string {
		const value = payload[claim];

		if (typeof value === "number") return String(value);

		if (typeof value !== "string" || !value) {
			throw new UnauthorizedException(`Invalid token payload: missing or invalid '${claim}'`);
		}

		return value;
	}
}
