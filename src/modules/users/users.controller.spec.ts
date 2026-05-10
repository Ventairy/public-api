import { describe, it, expect, vi, beforeEach } from "vitest";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

function createMockResponse() {
	const cookies: Record<string, { value: string; options: any }> = {};
	return {
		cookie: vi.fn().mockImplementation((name: string, value: string, options: any) => {
			cookies[name] = { value, options };
		}),
		clearCookie: vi.fn(),
		cookies,
	};
}

describe("UsersController", () => {
	let controller: UsersController;
	let usersService: { createUser: ReturnType<typeof vi.fn> };

	beforeEach(() => {
		usersService = { createUser: vi.fn() };
		controller = new UsersController(usersService as unknown as UsersService);
	});

	describe("create", () => {
		it("should delegate to usersService.createUser with walletAddress, message, signature, device info, ip", async () => {
			const mockResult = {
				user: {
					id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
					walletAddress: "0x742d35cc6634c0532925a3b844bc9e7595f0beb1",
					ventairyKycStatus: "PENDING",
					createdAt: "2026-05-04T14:48:00.000Z",
				},
				accessToken: "access-token-123",
				rawRefreshToken: "raw-refresh-token-456",
			};
			usersService.createUser.mockResolvedValue(mockResult);
			const mockRes = createMockResponse();
			const mockReq = { headers: { "user-agent": "Mozilla" }, ip: "127.0.0.1" };

			const result = await controller.create(
				{
					walletAddress: "0x742d35cc6634c0532925a3b844bc9e7595f0beb1",
					siwe: { message: "siwe-message", signature: "0xabc123" },
				},
				mockReq as any,
				mockRes as any,
			);

			expect(usersService.createUser).toHaveBeenCalledWith(
				"0x742d35cc6634c0532925a3b844bc9e7595f0beb1",
				"siwe-message",
				"0xabc123",
				"Mozilla",
				"127.0.0.1",
			);
			expect(result).toEqual(mockResult.user);
		});

		it("should set access and refresh cookies", async () => {
			usersService.createUser.mockResolvedValue({
				user: { id: "u-1", walletAddress: "0xabc", ventairyKycStatus: "PENDING", createdAt: "2026-01-01T00:00:00.000Z" },
				accessToken: "access-token-123",
				rawRefreshToken: "raw-refresh-token-456",
			});
			const mockRes = createMockResponse();
			const mockReq = { headers: {}, ip: "127.0.0.1" };

			await controller.create(
				{ walletAddress: "0xabc", siwe: { message: "msg", signature: "0xsig" } },
				mockReq as any,
				mockRes as any,
			);

			expect(mockRes.cookie).toHaveBeenCalledTimes(2);
			expect(mockRes.cookie).toHaveBeenCalledWith(
				"__Host-ventairy-access",
				"access-token-123",
				expect.objectContaining({ httpOnly: true, sameSite: "strict" }),
			);
			expect(mockRes.cookie).toHaveBeenCalledWith(
				"__Host-ventairy-refresh",
				"raw-refresh-token-456",
				expect.objectContaining({ httpOnly: true, sameSite: "strict" }),
			);
		});
	});
});
