import { describe, it, expect } from "vitest";
import { ReceiveQuoteInputDto } from "../receive-quote-input.dto";
import { PaymentMethod } from "@shared/constants";

describe("ReceiveQuoteInputDto", () => {
	it("should have correct properties", () => {
		const dto = new ReceiveQuoteInputDto();
		dto.amount = "100.00";
		dto.paymentMethod = PaymentMethod.PIX;

		expect(dto.amount).toBe("100.00");
		expect(dto.paymentMethod).toBe(PaymentMethod.PIX);
	});
});
