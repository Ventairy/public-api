import { registerAs } from "@nestjs/config";

export const APP_CONFIG_KEY = "app";

export const appConfig = registerAs(APP_CONFIG_KEY, () => ({
	nodeEnv: process.env["NODE_ENV"] as "development" | "production" | "test" | "staging",
	port: parseInt(process.env["PORT"] ?? "3000", 10),
}));

export interface AppConfig {
	nodeEnv: "development" | "production" | "test" | "staging";
	port: number;
}