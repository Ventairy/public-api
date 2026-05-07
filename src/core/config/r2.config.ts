import { registerAs } from "@nestjs/config";
import { R2BucketType } from "@shared/constants";

export const R2_CONFIG_KEY = "r2";

export const r2Config = registerAs(R2_CONFIG_KEY, () => ({
	endpoint: process.env["R2_ENDPOINT"],
	buckets: {
		[R2BucketType.BUSINESS_FILES]: {
			bucketName: process.env["R2_BUSINESS_FILES_BUCKET_NAME"],
			accessKeyId: process.env["R2_BUSINESS_FILES_ACCESS_KEY_ID"],
			secretAccessKey: process.env["R2_BUSINESS_FILES_SECRET_ACCESS_KEY"],
		},
	},
}));

export interface R2BucketConfig {
	bucketName: string;
	accessKeyId: string;
	secretAccessKey: string;
}

export interface R2Config {
	endpoint: string;
	buckets: Record<R2BucketType, R2BucketConfig>;
}
