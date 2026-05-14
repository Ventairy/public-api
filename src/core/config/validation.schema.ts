import Joi from "joi";

export const validationSchema = Joi.object({
	NODE_ENV: Joi.string().valid("development", "production", "test", "staging").default("development"),
	PORT: Joi.number().port().default(3000),

	CF_ACCOUNT_ID: Joi.string().required(),
	CF_D1_DATABASE_ID: Joi.string().required(),
	CF_D1_API_TOKEN: Joi.string().required(),

	LOG_LEVEL: Joi.string().valid("fatal", "error", "warn", "info", "debug", "trace").default("info"),

	SIWE_DOMAIN: Joi.string().required(),
	SIWE_URI: Joi.string().required(),
	SIWE_NONCE_TTL_SECONDS: Joi.number().integer().min(30).max(600).required(),

	JWT_SECRET: Joi.string().min(32).required(),


	R2_ENDPOINT: Joi.string().required(),
	R2_BUSINESS_FILES_ACCESS_KEY_ID: Joi.string().required(),
	R2_BUSINESS_FILES_SECRET_ACCESS_KEY: Joi.string().required(),
	R2_BUSINESS_FILES_BUCKET_NAME: Joi.string().required(),

	BLINDPAY_API_KEY: Joi.string().required(),
	BLINDPAY_INSTANCE_ID: Joi.string().required(),
});
