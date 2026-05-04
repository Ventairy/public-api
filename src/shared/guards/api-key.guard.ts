import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Unkey } from "@unkey/api";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";

import { IS_PUBLIC_KEY } from "@shared/decorators/public.decorator";
import { UNKEY_CONFIG_KEY, type UnkeyConfig } from "@core/config";

@Injectable()
export class ApiKeyGuard implements CanActivate {
	private readonly unkey: Unkey;

	constructor(
		private readonly reflector: Reflector,
		private readonly configService: ConfigService,
	) {
		const unkeyConfiguration = this.configService.get<UnkeyConfig>(UNKEY_CONFIG_KEY);

		if (!unkeyConfiguration) throw new Error("Unkey configuration is missing");

		this.unkey = new Unkey({ rootKey: unkeyConfiguration.rootKey });
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);
		if (isPublic) return true;

		const request = context.switchToHttp().getRequest<Request>();
		const apiKey = this.extractApiKeyFromHeader(request);

		if (!apiKey) throw new UnauthorizedException("No API key provided");

		const result = await this.unkey.keys.verifyKey({
			key: apiKey,
		});

		if (!result.data.valid) throw new UnauthorizedException("Invalid or revoked API key");

		request.user = {
			id: result.data.keyId ?? "unknown",
			permissions: result.data.permissions ?? [],
			meta: result.data.meta ?? {},
		};

		return true;
	}

	private extractApiKeyFromHeader(request: Request): string | undefined {
		return request.headers["x-api-key"] as string | undefined;
	}
}