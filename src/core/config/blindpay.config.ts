import { registerAs } from "@nestjs/config";

export const BLINDPAY_CONFIG_KEY = "blindpay";

export const blindpayConfig = registerAs(
	BLINDPAY_CONFIG_KEY,
	(): BlindpayConfig => ({
		apiKey: process.env["BLINDPAY_API_KEY"] as string,
		instanceId: process.env["BLINDPAY_INSTANCE_ID"] as string,
	}),
);

export interface BlindpayConfig {
	apiKey: string;
	instanceId: string;
}
