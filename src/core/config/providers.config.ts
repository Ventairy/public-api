import { registerAs } from "@nestjs/config";

export const PROVIDERS_CONFIG_KEY = "providers";

export const providersConfig = registerAs(PROVIDERS_CONFIG_KEY, () => ({
	blindpay: {
		apiKey: process.env["BLINDPAY_API_KEY"] ?? "",
		baseUrl: "https://api.blindpay.com",
	},
}));

export type ProvidersConfig = ReturnType<typeof providersConfig>;