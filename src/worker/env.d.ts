import { DurableObjectNamespace } from "@cloudflare/workers-types/experimental";
export interface Env {
	API_CONTAINER: DurableObjectNamespace;
	NODE_ENV: string;
	PORT: string;
	CF_ACCOUNT_ID: string;
	CF_D1_DATABASE_ID: string;
	CF_D1_API_TOKEN: string;
	LOG_LEVEL: string;
	SIWE_DOMAIN: string;
	SIWE_URI: string;
	SIWE_NONCE_TTL_SECONDS: string;
	R2_ENDPOINT: string;
	R2_BUSINESS_FILES_ACCESS_KEY_ID: string;
	R2_BUSINESS_FILES_SECRET_ACCESS_KEY: string;
	R2_BUSINESS_FILES_BUCKET_NAME: string;
}
