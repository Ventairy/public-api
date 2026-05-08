import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { R2_CONFIG_KEY, type R2Config, type R2BucketConfig } from "../config";
import { R2BucketType } from "@shared/enums/r2-bucket-type";

@Injectable()
export class R2StorageService implements OnModuleDestroy {
	private readonly _clients = new Map<R2BucketType, S3Client>();
	private readonly _bucketConfigs: Record<R2BucketType, R2BucketConfig>;
	private readonly _endpoint: string;

	constructor(private readonly configService: ConfigService) {
		const r2Config = this.configService.get<R2Config>(R2_CONFIG_KEY);
		if (!r2Config) throw new Error("R2 configuration is missing");

		this._endpoint = r2Config.endpoint;
		this._bucketConfigs = r2Config.buckets;
	}

	private _getClient(bucketType: R2BucketType): S3Client {
		let client = this._clients.get(bucketType);

		if (!client) {
			const bucketConfig = this._bucketConfigs[bucketType];
			if (!bucketConfig) throw new Error(`R2 bucket config not found for type: ${bucketType}`);

			client = new S3Client({
				region: "auto",
				endpoint: this._endpoint,
				credentials: {
					accessKeyId: bucketConfig.accessKeyId,
					secretAccessKey: bucketConfig.secretAccessKey,
				},
			});

			this._clients.set(bucketType, client);
		}

		return client;
	}

	private _getBucketName(bucketType: R2BucketType): string {
		const bucketConfig = this._bucketConfigs[bucketType];

		if (!bucketConfig?.bucketName) throw new Error(`R2 bucket name not configured for type: ${bucketType}`);
		return bucketConfig.bucketName;
	}

	public async uploadFile(params: {
		bucketType: R2BucketType;
		key: string;
		body: Buffer;
		contentType: string;
	}): Promise<void> {
		const client = this._getClient(params.bucketType);
		const bucket = this._getBucketName(params.bucketType);

		await client.send(
			new PutObjectCommand({
				Bucket: bucket,
				Key: params.key,
				Body: params.body,
				ContentType: params.contentType,
			}),
		);
	}

	public async getFileBuffer(bucketType: R2BucketType, key: string): Promise<Buffer> {
		const client = this._getClient(bucketType);
		const bucket = this._getBucketName(bucketType);

		const response = await client.send(
			new GetObjectCommand({
				Bucket: bucket,
				Key: key,
			}),
		);

		if (!response.Body) throw new Error(`File not found at key: ${key}`);

		const bytes = await response.Body.transformToByteArray();
		return Buffer.from(bytes);
	}

	public async deleteFile(bucketType: R2BucketType, key: string): Promise<void> {
		const client = this._getClient(bucketType);
		const bucket = this._getBucketName(bucketType);

		await client.send(
			new DeleteObjectCommand({
				Bucket: bucket,
				Key: key,
			}),
		);
	}

	public generateFileKey(folder: string): string {
		return `${folder}/${crypto.randomUUID()}`;
	}

	public onModuleDestroy(): void {
		for (const client of this._clients.values()) client.destroy();
	}
}
