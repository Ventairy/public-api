import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  API_PREFIX: Joi.string().default('api'),

  CORS_ALLOWED_DOMAINS: Joi.string().required(),

  CF_ACCOUNT_ID: Joi.string().required(),
  CF_D1_DATABASE_ID: Joi.string().required(),
  CF_D1_API_TOKEN: Joi.string().required(),

  UNKEY_API_ID: Joi.string().required(),
  UNKEY_ROOT_KEY: Joi.string().required(),

  BLINDPAY_API_KEY: Joi.string().required(),

  LOG_LEVEL: Joi.string()
    .valid('fatal', 'error', 'warn', 'info', 'debug', 'trace')
    .default('info'),

  SWAGGER_ENABLED: Joi.string()
    .valid('true', 'false')
    .default('false'),
});
