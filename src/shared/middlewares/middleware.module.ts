import { Module } from "@nestjs/common";
import { CorsMiddleware } from "./cors.middleware";

@Module({
	providers: [CorsMiddleware],
	exports: [CorsMiddleware],
})
export class MiddlewareModule {}
