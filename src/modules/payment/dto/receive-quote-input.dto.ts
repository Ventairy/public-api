import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsString, IsNotEmpty, IsEnum } from "class-validator";
import { PaymentMethod } from "@shared/enums";

export class ReceiveQuoteInputDto {
	@ApiProperty({
		name: "amount",
		description: "The fiat amount to be paid.",
		example: "100.00",
		pattern: "^[0-9]+(\\.[0-9]+)?$",
		required: true,
	})
	@Expose({ name: "amount" })
	@IsString()
	@IsNotEmpty()
	amount!: string;

	@ApiProperty({
		name: "payment_method",
		description: "The payment method the payer will use to make the payment.",
		enum: PaymentMethod,
		example: PaymentMethod.PIX,
		required: true,
	})
	@Expose({ name: "payment_method" })
	@IsEnum(PaymentMethod)
	paymentMethod!: PaymentMethod;
}
