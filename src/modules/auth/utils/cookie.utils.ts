import { CookieOptions, type Request, type Response } from "express";
import {
	ACCESS_COOKIE_NAME,
	REFRESH_COOKIE_NAME,
	ACCESS_TOKEN_TTL_SECONDS,
	REFRESH_TOKEN_TTL_SECONDS,
} from "../constants/token.constants";

const COOKIE_OPTIONS: CookieOptions = {
	httpOnly: true,
	secure: true,
	sameSite: "strict",
	path: "/",
};

export const CookieUtils = {
	extractCookie(request: Request, cookieName: string): string | null {
		const cookies = request.headers["cookie"];
		if (!cookies) return null;

		const cookiePairs = cookies.split(";").map((c) => c.trim());
		for (const pair of cookiePairs) {
			const [name, ...valueParts] = pair.split("=");
			if (name === cookieName) {
				return valueParts.join("=");
			}
		}

		return null;
	},

	setAuthCookies(res: Response, params: { accessToken: string; refreshToken: string }): void {
		res.cookie(ACCESS_COOKIE_NAME, params.accessToken, {
			...COOKIE_OPTIONS,
			maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000,
		});

		res.cookie(REFRESH_COOKIE_NAME, params.refreshToken, {
			...COOKIE_OPTIONS,
			maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
		});
	},

	clearAuthCookies(res: Response): void {
		res.clearCookie(ACCESS_COOKIE_NAME, COOKIE_OPTIONS);
		res.clearCookie(REFRESH_COOKIE_NAME, COOKIE_OPTIONS);
	},
} as const;
