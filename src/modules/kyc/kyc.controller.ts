import {
	ClassSerializerInterceptor,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Post,
	UseInterceptors,
} from "@nestjs/common";
import { KycService } from "./kyc.service";
import { KycSubmissionOutputDto, KycStatusOutputDto } from "./dto";
import { ApiSubmitKycDocs } from "./docs/api-submit-kyc-docs.decorator";
import { ApiGetKycStatusDocs } from "./docs/api-get-kyc-status-docs.decorator";

@UseInterceptors(ClassSerializerInterceptor)
@Controller("kyc")
export class KycController {
	constructor(private readonly kycService: KycService) {}

	@Post(":user_id/submit")
	@HttpCode(HttpStatus.OK)
	@ApiSubmitKycDocs()
	public async submitKyc(@Param("user_id") userId: string): Promise<KycSubmissionOutputDto> {
		return this.kycService.submitKyc(userId);
	}

	@Get(":user_id/status")
	@HttpCode(HttpStatus.OK)
	@ApiGetKycStatusDocs()
	public async getKycStatus(@Param("user_id") userId: string): Promise<KycStatusOutputDto> {
		return this.kycService.getKycStatus(userId);
	}
}
