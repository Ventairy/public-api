import { registerAs } from "@nestjs/config";

export const SIWE_CONFIG_KEY = "siwe";

export const siweConfig = registerAs(SIWE_CONFIG_KEY, () => ({
	domain: process.env["SIWE_DOMAIN"],
	uri: process.env["SIWE_URI"],
	nonceTtlSeconds: parseInt(process.env["SIWE_NONCE_TTL_SECONDS"] || "180", 10),
}));

export interface SiweConfig {
	domain: string;
	uri: string;
	nonceTtlSeconds: number;
}
