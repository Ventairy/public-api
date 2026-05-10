import { registerAs } from "@nestjs/config";

export const JWT_CONFIG_KEY = "jwt";

export const jwtConfig = registerAs(JWT_CONFIG_KEY, () => ({
	secret: process.env["JWT_SECRET"] as string,
}));

export interface JwtConfig {
	secret: string;
}
