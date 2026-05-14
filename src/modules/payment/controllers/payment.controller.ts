import {
	Controller,
	Post,
	Body,
	HttpCode,
	HttpStatus,
	UseInterceptors,
	ClassSerializerInterceptor,
} from "@nestjs/common";
import { CurrentActor } from "@shared/decorators/current-actor.decorator";
import { KYCRequired } from "@shared/decorators";
import { RateLimit } from "@shared/rate-limit/rate-limit.decorator";
import type { Actor } from "@shared/types/actor.type";
import { PaymentService } from "../payment.service";
import { ReceiveQuoteInputDto, ReceiveQuoteOutputDto } from "../dto";
import { ApiReceiveQuoteDocs } from "../docs/api-receive-quote-docs.decorator";

@UseInterceptors(ClassSerializerInterceptor)
@KYCRequired()
@Controller("payment")
export class PaymentController {
	constructor(private readonly _paymentService: PaymentService) {}

	@Post("receive/quote")
	@HttpCode(HttpStatus.OK)
	@RateLimit({ limit: 10, ttlSeconds: 60 })
	@ApiReceiveQuoteDocs()
	public async receiveQuote(
		@CurrentActor() actor: Actor,
		@Body() body: ReceiveQuoteInputDto,
	): Promise<ReceiveQuoteOutputDto> {
		return this._paymentService.getReceiveQuote({
			actor,
			amount: body.amount,
			paymentMethod: body.paymentMethod,
		});
	}
}
