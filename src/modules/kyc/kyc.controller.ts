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
import { KycService } from "./kyc.service";
import { KycSubmissionOutputDto, KycStatusOutputDto } from "./dto";
import { ApiSubmitKycDocs } from "./docs/api-submit-kyc-docs.decorator";
import { ApiGetKycStatusDocs } from "./docs/api-get-kyc-status-docs.decorator";

@UseInterceptors(ClassSerializerInterceptor)
@Controller("kyc")
export class KycController {
	constructor(private readonly kycService: KycService) {}

	@Post("submit")
	@HttpCode(HttpStatus.OK)
	@RateLimit({ limit: 3, ttlSeconds: 900 })
	@ApiSubmitKycDocs()
	public async submitKyc(@CurrentActor() actor: Actor): Promise<KycSubmissionOutputDto> {
		return this.kycService.submitKyc(actor.id);
	}

	@Get("status")
	@HttpCode(HttpStatus.OK)
	@RateLimit({ limit: 20, ttlSeconds: 60 })
	@ApiGetKycStatusDocs()
	public async getKycStatus(@CurrentActor() actor: Actor): Promise<KycStatusOutputDto> {
		return this.kycService.getKycStatus(actor.id);
	}
}
