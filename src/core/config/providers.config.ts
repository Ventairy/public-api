import { registerAs } from "@nestjs/config";

export const providersConfig = registerAs("providers", () => ({
	blindpay: {
		apiKey: process.env["BLINDPAY_API_KEY"] ?? "",
		baseUrl: "https://api.blindpay.com",
	},
}));

export type ProvidersConfig = ReturnType<typeof providersConfig>;
