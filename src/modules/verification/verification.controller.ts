import {
	ClassSerializerInterceptor,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	UseInterceptors,
} from "@nestjs/common";
import { CurrentActor } from "@shared/decorators/current-actor.decorator";
import { RateLimit } from "@shared/rate-limit/rate-limit.decorator";
import type { Actor } from "@shared/types/actor.type";
import { VerificationService } from "./verification.service";
import { VerificationSubmissionOutputDto, VerificationStatusOutputDto } from "./dto";
import { ApiSubmitVerificationDocs } from "./docs/api-submit-verification-docs.decorator";
import { ApiGetVerificationStatusDocs } from "./docs/api-get-verification-status-docs.decorator";

@UseInterceptors(ClassSerializerInterceptor)
@Controller("verification")
export class VerificationController {
	constructor(private readonly _verificationService: VerificationService) {}

	@Post("submit")
	@HttpCode(HttpStatus.OK)
	@RateLimit({ limit: 3, ttlSeconds: 900 })
	@ApiSubmitVerificationDocs()
	public async submitVerification(@CurrentActor() actor: Actor): Promise<VerificationSubmissionOutputDto> {
		return this._verificationService.submitVerification(actor);
	}

	@Get("status")
	@HttpCode(HttpStatus.OK)
	@RateLimit({ limit: 20, ttlSeconds: 60 })
	@ApiGetVerificationStatusDocs()
	public async getVerificationStatus(@CurrentActor() actor: Actor): Promise<VerificationStatusOutputDto> {
		return this._verificationService.getVerificationStatus(actor);
	}
}
