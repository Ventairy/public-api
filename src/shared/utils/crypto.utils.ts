import { createHash, randomBytes } from "node:crypto";

export const CryptoUtils = {
	generateSecureRandom(byteLength: number): string {
		return randomBytes(byteLength).toString("hex");
	},

	hashSha256(input: string): string {
		return createHash("sha256").update(input).digest("hex");
	},
} as const;
