import { describe, it, expect, vi, beforeEach } from "vitest";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

describe("UsersController", () => {
	let controller: UsersController;
	let usersService: { createUser: ReturnType<typeof vi.fn> };

	beforeEach(() => {
		usersService = { createUser: vi.fn() };
		controller = new UsersController(
			usersService as unknown as UsersService,
		);
	});

	describe("create", () => {
		it("should delegate to usersService.createUser with walletAddress, message, and signature", async () => {
			const expectedResult = {
				id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
				wallet_address: "0x742d35cc6634c0532925a3b844bc9e7595f0beb1",
				ventairy_kyc_status: "PENDING",
				created_at: "2026-05-04T14:48:00.000Z",
				updated_at: "2026-05-04T14:48:00.000Z",
			};
			usersService.createUser.mockResolvedValue(expectedResult);

			const result = await controller.create({
				walletAddress: "0x742d35cc6634c0532925a3b844bc9e7595f0beb1",
				siwe: { message: "siwe-message", signature: "0xabc123" },
			});

			expect(usersService.createUser).toHaveBeenCalledWith(
				"0x742d35cc6634c0532925a3b844bc9e7595f0beb1",
				"siwe-message",
				"0xabc123",
			);
			expect(result).toEqual(expectedResult);
		});
	});
});
