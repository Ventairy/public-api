import { describe, it, expect, vi, beforeEach } from "vitest";
import { PaymentController } from "./payment.controller";
import { PaymentMethod } from "@shared/constants";
import type { Actor } from "@shared/types/actor.type";
import type { UserType } from "@shared/enums/user-type";

const MOCK_ACTOR: Actor = { id: "user-1", sessionId: "session-1", userType: "BUSINESS" as UserType };

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

			const body = { amount: "100.00", paymentMethod: PaymentMethod.PIX };
			const result = await controller.receiveQuote(MOCK_ACTOR, body);

			expect(mockPaymentService.getReceiveQuote).toHaveBeenCalledWith({
				actor: MOCK_ACTOR,
				amount: "100.00",
				paymentMethod: PaymentMethod.PIX,
			});
			expect(result).toEqual(expectedOutput);
		});
	});
});
