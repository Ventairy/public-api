import { DurableObjectNamespace } from "@cloudflare/workers-types/experimental";
export interface Env {
	API_CONTAINER: DurableObjectNamespace;
	NODE_ENV: string;
	PORT: string;
	CF_ACCOUNT_ID: string;
	CF_D1_DATABASE_ID: string;
	CF_D1_API_TOKEN: string;
	BLINDPAY_API_KEY: string;
	LOG_LEVEL: string;
}
