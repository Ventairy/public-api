import { describe, it, expect } from "vitest";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { ReceiveQuoteInputDto } from "../receive-quote-input.dto";
import { PaymentMethod } from "@shared/enums";

describe("ReceiveQuoteInputDto", () => {
	it("should validate a correct dto", async () => {
		const input = { amount: "100.00", payment_method: PaymentMethod.PIX };

		const dto = plainToInstance(ReceiveQuoteInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBe(0);
	});

	it("should accept amount without decimal places", async () => {
		const input = { amount: "50", payment_method: PaymentMethod.PIX };

		const dto = plainToInstance(ReceiveQuoteInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBe(0);
	});

	it("should fail validation when amount is missing", async () => {
		const input = { payment_method: PaymentMethod.PIX };

		const dto = plainToInstance(ReceiveQuoteInputDto, input);
		const errors = await validate(dto);
		expect(errors).toHaveLength(1);
		expect(errors[0]!.property).toBe("amount");
expect(errors[0]!.constraints).toHaveProperty("isNotEmpty");
	});

	it("should accept amount without decimal places", async () => {
		const input = { amount: "50", payment_method: PaymentMethod.PIX };

		const dto = plainToInstance(ReceiveQuoteInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBe(0);
	});

	it("should fail validation when amount is missing", async () => {
		const input = { payment_method: PaymentMethod.PIX };

		const dto = plainToInstance(ReceiveQuoteInputDto, input);
		const errors = await validate(dto);
		expect(errors).toHaveLength(1);
		expect(errors[0]!.property).toBe("amount");
		expect(errors[0]!.constraints).toHaveProperty("isNotEmpty");
	});

	it("should fail validation when amount is empty string", async () => {
		const input = { amount: "", payment_method: PaymentMethod.PIX };

		const dto = plainToInstance(ReceiveQuoteInputDto, input);
		const errors = await validate(dto);
		expect(errors).toHaveLength(1);
		expect(errors[0]!.property).toBe("amount");
		expect(errors[0]!.constraints).toHaveProperty("isNotEmpty");
	});

	it("should fail validation when amount is a number instead of string", async () => {
		const input = { amount: 100, payment_method: PaymentMethod.PIX };

		const dto = plainToInstance(ReceiveQuoteInputDto, input);
		const errors = await validate(dto);
		expect(errors).toHaveLength(1);
		expect(errors[0]!.property).toBe("amount");
		expect(errors[0]!.constraints).toHaveProperty("isString");
	});

	it("should fail validation when amount is null", async () => {
		const input = { amount: null, payment_method: PaymentMethod.PIX };

		const dto = plainToInstance(ReceiveQuoteInputDto, input);
		const errors = await validate(dto);
		expect(errors).toHaveLength(1);
		expect(errors[0]!.property).toBe("amount");
	});

	it("should fail validation when amount is an object", async () => {
		const input = { amount: {}, payment_method: PaymentMethod.PIX };

		const dto = plainToInstance(ReceiveQuoteInputDto, input);
		const errors = await validate(dto);
		expect(errors).toHaveLength(1);
		expect(errors[0]!.property).toBe("amount");
		expect(errors[0]!.constraints).toHaveProperty("isString");
	});

	it("should fail validation when amount is a boolean", async () => {
		const input = { amount: true, payment_method: PaymentMethod.PIX };

		const dto = plainToInstance(ReceiveQuoteInputDto, input);
		const errors = await validate(dto);
		expect(errors).toHaveLength(1);
		expect(errors[0]!.property).toBe("amount");
		expect(errors[0]!.constraints).toHaveProperty("isString");
	});

	it("should fail validation when amount is an array", async () => {
		const input = { amount: ["100.00"], payment_method: PaymentMethod.PIX };

		const dto = plainToInstance(ReceiveQuoteInputDto, input);
		const errors = await validate(dto);
		expect(errors).toHaveLength(1);
		expect(errors[0]!.property).toBe("amount");
		expect(errors[0]!.constraints).toHaveProperty("isString");
	});

	it("should fail validation when paymentMethod is missing", async () => {
		const input = { amount: "100.00" };

		const dto = plainToInstance(ReceiveQuoteInputDto, input);
		const errors = await validate(dto);
		expect(errors).toHaveLength(1);
		expect(errors[0]!.property).toBe("paymentMethod");
		expect(errors[0]!.constraints).toHaveProperty("isEnum");
	});

	it("should fail validation when paymentMethod is null", async () => {
		const input = { amount: "100.00", payment_method: null };

		const dto = plainToInstance(ReceiveQuoteInputDto, input);
		const errors = await validate(dto);
		expect(errors).toHaveLength(1);
		expect(errors[0]!.property).toBe("paymentMethod");
	});

	it("should fail validation when paymentMethod is an invalid string", async () => {
		const input = { amount: "100.00", payment_method: "NOT_A_REAL_METHOD" };

		const dto = plainToInstance(ReceiveQuoteInputDto, input);
		const errors = await validate(dto);
		expect(errors).toHaveLength(1);
		expect(errors[0]!.property).toBe("paymentMethod");
		expect(errors[0]!.constraints).toHaveProperty("isEnum");
	});

	it("should fail validation when paymentMethod is a number", async () => {
		const input = { amount: "100.00", payment_method: 123 };

		const dto = plainToInstance(ReceiveQuoteInputDto, input);
		const errors = await validate(dto);
		expect(errors).toHaveLength(1);
		expect(errors[0]!.property).toBe("paymentMethod");
		expect(errors[0]!.constraints).toHaveProperty("isEnum");
	});

	it("should fail validation when paymentMethod is an object", async () => {
		const input = { amount: "100.00", payment_method: {} };

		const dto = plainToInstance(ReceiveQuoteInputDto, input);
		const errors = await validate(dto);
		expect(errors).toHaveLength(1);
		expect(errors[0]!.property).toBe("paymentMethod");
		expect(errors[0]!.constraints).toHaveProperty("isEnum");
	});

	it("should fail validation when paymentMethod is a boolean", async () => {
		const input = { amount: "100.00", payment_method: false };

		const dto = plainToInstance(ReceiveQuoteInputDto, input);
		const errors = await validate(dto);
		expect(errors).toHaveLength(1);
		expect(errors[0]!.property).toBe("paymentMethod");
		expect(errors[0]!.constraints).toHaveProperty("isEnum");
	});

	it("should fail validation when paymentMethod is an empty string", async () => {
		const input = { amount: "100.00", payment_method: "" };

		const dto = plainToInstance(ReceiveQuoteInputDto, input);
		const errors = await validate(dto);
		expect(errors).toHaveLength(1);
		expect(errors[0]!.property).toBe("paymentMethod");
		expect(errors[0]!.constraints).toHaveProperty("isEnum");
	});

	it("should fail validation when amount is a number instead of string", async () => {
		const input = { amount: 100, payment_method: PaymentMethod.PIX };

		const dto = plainToInstance(ReceiveQuoteInputDto, input);
		const errors = await validate(dto);
		expect(errors).toHaveLength(1);
		expect(errors[0]!.property).toBe("amount");
		expect(errors[0]!.constraints).toHaveProperty("isString");
	});

	it("should fail validation when amount is null", async () => {
		const input = { amount: null, payment_method: PaymentMethod.PIX };

		const dto = plainToInstance(ReceiveQuoteInputDto, input);
		const errors = await validate(dto);
		expect(errors).toHaveLength(1);
		expect(errors[0]!.property).toBe("amount");
	});

	it("should fail validation when amount is an object", async () => {
		const input = { amount: {}, payment_method: PaymentMethod.PIX };

		const dto = plainToInstance(ReceiveQuoteInputDto, input);
		const errors = await validate(dto);
		expect(errors).toHaveLength(1);
		expect(errors[0]!.property).toBe("amount");
		expect(errors[0]!.constraints).toHaveProperty("isString");
	});

	it("should fail validation when amount is a boolean", async () => {
		const input = { amount: true, payment_method: PaymentMethod.PIX };

		const dto = plainToInstance(ReceiveQuoteInputDto, input);
		const errors = await validate(dto);
		expect(errors).toHaveLength(1);
		expect(errors[0]!.property).toBe("amount");
		expect(errors[0]!.constraints).toHaveProperty("isString");
	});

	it("should fail validation when amount is an array", async () => {
		const input = { amount: ["100.00"], payment_method: PaymentMethod.PIX };

		const dto = plainToInstance(ReceiveQuoteInputDto, input);
		const errors = await validate(dto);
		expect(errors).toHaveLength(1);
		expect(errors[0]!.property).toBe("amount");
		expect(errors[0]!.constraints).toHaveProperty("isString");
	});

	it("should fail validation when paymentMethod is missing", async () => {
		const input = { amount: "100.00" };

		const dto = plainToInstance(ReceiveQuoteInputDto, input);
		const errors = await validate(dto);
		expect(errors).toHaveLength(1);
		expect(errors[0]!.property).toBe("paymentMethod");
		expect(errors[0]!.constraints).toHaveProperty("isEnum");
	});

	it("should fail validation when paymentMethod is null", async () => {
		const input = { amount: "100.00", payment_method: null };

		const dto = plainToInstance(ReceiveQuoteInputDto, input);
		const errors = await validate(dto);
		expect(errors).toHaveLength(1);
		expect(errors[0]!.property).toBe("paymentMethod");
	});

	it("should fail validation when paymentMethod is an invalid string", async () => {
		const input = { amount: "100.00", payment_method: "NOT_A_REAL_METHOD" };

		const dto = plainToInstance(ReceiveQuoteInputDto, input);
		const errors = await validate(dto);
		expect(errors).toHaveLength(1);
		expect(errors[0]!.property).toBe("paymentMethod");
		expect(errors[0]!.constraints).toHaveProperty("isEnum");
	});

	it("should fail validation when paymentMethod is a number", async () => {
		const input = { amount: "100.00", payment_method: 123 };

		const dto = plainToInstance(ReceiveQuoteInputDto, input);
		const errors = await validate(dto);
		expect(errors).toHaveLength(1);
		expect(errors[0]!.property).toBe("paymentMethod");
		expect(errors[0]!.constraints).toHaveProperty("isEnum");
	});

	it("should fail validation when paymentMethod is an object", async () => {
		const input = { amount: "100.00", payment_method: {} };

		const dto = plainToInstance(ReceiveQuoteInputDto, input);
		const errors = await validate(dto);
		expect(errors).toHaveLength(1);
		expect(errors[0]!.property).toBe("paymentMethod");
		expect(errors[0]!.constraints).toHaveProperty("isEnum");
	});

	it("should fail validation when paymentMethod is a boolean", async () => {
		const input = { amount: "100.00", payment_method: false };

		const dto = plainToInstance(ReceiveQuoteInputDto, input);
		const errors = await validate(dto);
		expect(errors).toHaveLength(1);
		expect(errors[0]!.property).toBe("paymentMethod");
		expect(errors[0]!.constraints).toHaveProperty("isEnum");
	});

	it("should fail validation when paymentMethod is an empty string", async () => {
		const input = { amount: "100.00", payment_method: "" };

		const dto = plainToInstance(ReceiveQuoteInputDto, input);
		const errors = await validate(dto);
		expect(errors).toHaveLength(1);
		expect(errors[0]!.property).toBe("paymentMethod");
		expect(errors[0]!.constraints).toHaveProperty("isEnum");
	});

	it("should fail validation when both fields are missing", async () => {
		const input = {};

		const dto = plainToInstance(ReceiveQuoteInputDto, input);
		const errors = await validate(dto);
		expect(errors).toHaveLength(2);
	});

	it("should fail validation when both fields are null", async () => {
		const input = { amount: null, payment_method: null };

		const dto = plainToInstance(ReceiveQuoteInputDto, input);
		const errors = await validate(dto);
		expect(errors).toHaveLength(2);
	});

	it("should ignore extra unknown fields", async () => {
		const input = { amount: "100.00", payment_method: PaymentMethod.PIX, extra_field: "should be ignored" };

		const dto = plainToInstance(ReceiveQuoteInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBe(0);
	});
});
