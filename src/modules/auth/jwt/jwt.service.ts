import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { JWT_CONFIG_KEY, type JwtConfig } from "@core/config";
import { ACCESS_TOKEN_TTL_SECONDS } from "../constants/token.constants";

export interface AccessTokenPayload {
	sub: string;
	sid: string;
}

@Injectable()
export class JwtService {
	private readonly _secret: Uint8Array;

	constructor(private readonly _configService: ConfigService) {
		const config = this._configService.get<JwtConfig>(JWT_CONFIG_KEY);
		if (!config) throw new Error("JWT configuration is missing");

		this._secret = new TextEncoder().encode(config.secret);
	}

	public async generateAccessToken(params: { userId: string; sessionId: string }): Promise<string> {
		const jwt = await new SignJWT({ sub: params.userId, sid: params.sessionId } as unknown as JWTPayload)
			.setProtectedHeader({ alg: "HS256" })
			.setIssuedAt()
			.setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
			.sign(this._secret);

		return jwt;
	}

	public async verifyAccessToken(token: string): Promise<AccessTokenPayload & { iat: number; exp: number }> {
		try {
			const { payload } = await jwtVerify(token, this._secret, { algorithms: ["HS256"] });

			const sub = payload.sub;
			const sid: string | undefined = payload["sid"] as string | undefined;

			if (!sub || !sid) throw new UnauthorizedException("Invalid token payload: missing sub or sid");

			return {
				sub,
				sid,
				iat: payload.iat ?? 0,
				exp: payload.exp ?? 0,
			};
		} catch (error) {
			if (error instanceof UnauthorizedException) throw error;
			throw new UnauthorizedException("Invalid or expired access token");
		}
	}
}
