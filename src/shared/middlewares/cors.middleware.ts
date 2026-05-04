import { Injectable, NestMiddleware } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request, Response, NextFunction } from "express";

import { APP_CONFIG_KEY, type AppConfig } from "@core/config";

@Injectable()
export class CorsMiddleware implements NestMiddleware {
	private readonly allowedDomainSuffixes: string[];

	constructor(private readonly configService: ConfigService) {
		const appConfiguration = this.configService.get<AppConfig>(APP_CONFIG_KEY);
		if (!appConfiguration) throw new Error("Application configuration is missing");

		this.allowedDomainSuffixes = (appConfiguration.corsAllowedDomains ?? []).map((domain) =>
			domain.trim().toLowerCase(),
		);
	}

	use(request: Request, response: Response, next: NextFunction): void {
		const origin = request.headers.origin;

		if (!origin) {
			next();
			return;
		}

		const allowedMethods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];
		const allowedHeaders = [
			"Content-Type",
			"Authorization",
			"X-Api-Key",
			"X-Request-Id",
			"Idempotency-Key",
		];

		const originHostname = this.extractHostname(origin);

		const isAllowed = this.allowedDomainSuffixes.some(
			(suffix) => originHostname === suffix || originHostname.endsWith(`.${suffix}`),
		);

		if (!isAllowed) {
			response.status(403).json({
				statusCode: 403,
				code: "CORS_FORBIDDEN",
				message: "Origin not allowed",
			});
			return;
		}

		response.setHeader("Access-Control-Allow-Origin", origin);
		response.setHeader("Access-Control-Allow-Methods", allowedMethods.join(", "));
		response.setHeader("Access-Control-Allow-Headers", allowedHeaders.join(", "));
		response.setHeader("Access-Control-Allow-Credentials", "false");
		response.setHeader("Access-Control-Max-Age", "86400");

		if (request.method === "OPTIONS") {
			response.status(204).end();
			return;
		}

		next();
	}

	private extractHostname(url: string): string {
		try {
			const parsedUrl = new URL(url);
			return parsedUrl.hostname.toLowerCase();
		} catch {
			return "";
		}
	}
}