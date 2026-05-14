import { describe, it, expect, vi, beforeEach } from "vitest";
import { PaymentController } from "./payment.controller";
import { PaymentMethod, VentairyKycStatus } from "@shared/enums";
import type { Actor } from "@shared/types/actor.type";
import type { UserType } from "@shared/enums/user-type";
import { ReceiveQuoteInputDto } from "../dto";

const MOCK_ACTOR: Actor = {
	id: "user-1",
	sessionId: "session-1",
	userType: "BUSINESS" as UserType,
	walletAddress: "0x742d35cc6634c0532925a3b844bc9e7595f0beb1",
	chainId: 8453,
	kycStatus: VentairyKycStatus.APPROVED,
};

describe("PaymentController", () => {
	let controller: PaymentController;
	let mockPaymentService: { getReceiveQuote: ReturnType<typeof vi.fn> };

	beforeEach(() => {
		vi.clearAllMocks();
		mockPaymentService = { getReceiveQuote: vi.fn() };
		controller = new PaymentController(mockPaymentService as any);
	});

	describe("receiveQuote", () => {
		it("should call getReceiveQuote with actor and input", async () => {
			const expectedOutput = { quotes: [] };
			mockPaymentService.getReceiveQuote.mockResolvedValue(expectedOutput);

			const body = { amount: "100.00", paymentMethod: PaymentMethod.PIX } as ReceiveQuoteInputDto;
			const result = await controller.receiveQuote(MOCK_ACTOR, body);

			expect(mockPaymentService.getReceiveQuote).toHaveBeenCalledWith({
				actor: MOCK_ACTOR,
				amount: "100.00",
				paymentMethod: PaymentMethod.PIX,
			});
			expect(result).toEqual(expectedOutput);
		});

		it("should handle different payment methods", async () => {
			mockPaymentService.getReceiveQuote.mockResolvedValue({ quotes: [] });

			const body = { amount: "200.00", paymentMethod: PaymentMethod.PIX } as ReceiveQuoteInputDto;
			await controller.receiveQuote(MOCK_ACTOR, body);

			expect(mockPaymentService.getReceiveQuote).toHaveBeenCalledWith({
				actor: MOCK_ACTOR,
				amount: "200.00",
				paymentMethod: PaymentMethod.PIX,
			});
		});

		it("should pass amount with decimal places", async () => {
			mockPaymentService.getReceiveQuote.mockResolvedValue({ quotes: [] });

			const body = { amount: "0.01", paymentMethod: PaymentMethod.PIX } as ReceiveQuoteInputDto;
			await controller.receiveQuote(MOCK_ACTOR, body);

			expect(mockPaymentService.getReceiveQuote).toHaveBeenCalledWith({
				actor: MOCK_ACTOR,
				amount: "0.01",
				paymentMethod: PaymentMethod.PIX,
			});
		});

		it("should pass amount without decimal places", async () => {
			mockPaymentService.getReceiveQuote.mockResolvedValue({ quotes: [] });

			const body = { amount: "50", paymentMethod: PaymentMethod.PIX } as ReceiveQuoteInputDto;
			await controller.receiveQuote(MOCK_ACTOR, body);

			expect(mockPaymentService.getReceiveQuote).toHaveBeenCalledWith({
				actor: MOCK_ACTOR,
				amount: "50",
				paymentMethod: PaymentMethod.PIX,
			});
		});

		it("should throw when service throws", async () => {
			const error = new Error("Provider unavailable");
			mockPaymentService.getReceiveQuote.mockRejectedValue(error);

			const body = { amount: "100.00", paymentMethod: PaymentMethod.PIX } as ReceiveQuoteInputDto;

			await expect(controller.receiveQuote(MOCK_ACTOR, body)).rejects.toThrow(error);
		});
	});
});
