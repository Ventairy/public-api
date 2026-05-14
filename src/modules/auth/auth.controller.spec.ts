import { describe, it, expect, vi, beforeEach } from "vitest";
import { SupportedBlockchain } from "@shared/blockchain";
import { UserType, VentairyKycStatus } from "@shared/enums";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

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

describe("AuthController", () => {
	let controller: AuthController;
	let mockWalletAuthService: any;
	let mockAuthService: any;

	beforeEach(() => {
		mockWalletAuthService = {
			createNonce: vi
				.fn()
				.mockResolvedValue({ nonce: "abc123", expiresAt: "2026-01-01T00:00:00.000Z", walletAddress: "0xabc" }),
		};
		mockAuthService = {
			login: vi.fn(),
			refreshTokens: vi.fn(),
			logout: vi.fn(),
			listSessions: vi.fn(),
			revokeSession: vi.fn(),
			logoutOthers: vi.fn(),
		};
		controller = new AuthController(mockWalletAuthService as any, mockAuthService as any);
	});

	describe("createNonce", () => {
		it("should call walletAuthService.createNonce with walletAddress and chainId and return result", async () => {
			const result = await controller.createNonce({ walletAddress: "0xabc", chainId: SupportedBlockchain.BASE } as any);
			expect(mockWalletAuthService.createNonce).toHaveBeenCalledWith("0xabc", SupportedBlockchain.BASE);
			expect(result.nonce).toBe("abc123");
		});
	});

	describe("login", () => {
		it("should call authService.login and set cookies", async () => {
			mockAuthService.login.mockResolvedValue({
				output: { expiresAt: "2026-01-08T00:00:00.000Z" },
				accessToken: "access-token",
				rawRefreshToken: "refresh-token",
			});
			const mockRes = createMockResponse();
			const mockReq = { headers: { "user-agent": "Mozilla" }, ip: "127.0.0.1" };

			const result = await controller.login(
				{ siwe: { message: "msg", signature: "0xsig" } } as any,
				mockReq as any,
				mockRes as any,
			);

			expect(mockAuthService.login).toHaveBeenCalledWith({
				message: "msg",
				signature: "0xsig",
				deviceInfo: "Mozilla",
				ipAddress: "127.0.0.1",
			});
			expect(mockRes.cookie).toHaveBeenCalledTimes(2);
			expect(result.expiresAt).toBe("2026-01-08T00:00:00.000Z");
		});
	});

	describe("refresh", () => {
		it("should call authService.refreshTokens and set cookies", async () => {
			mockAuthService.refreshTokens.mockResolvedValue({
				output: { expiresAt: "2026-01-08T00:00:00.000Z" },
				accessToken: "new-access",
				newRawRefreshToken: "new-refresh",
			});
			const mockRes = createMockResponse();
			const mockReq = { headers: {} };

			const result = await controller.refresh(mockReq as any, mockRes as any);

			expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(mockReq);
			expect(mockRes.cookie).toHaveBeenCalledTimes(2);
			expect(result.expiresAt).toBe("2026-01-08T00:00:00.000Z");
		});
	});

	describe("logout", () => {
		it("should call authService.logout and clear cookies", async () => {
			const mockRes = createMockResponse();
			const mockReq = { headers: {} };

			await controller.logout(mockReq as any, mockRes as any);

			expect(mockAuthService.logout).toHaveBeenCalledWith(mockReq);
			expect(mockRes.clearCookie).toHaveBeenCalledTimes(2);
		});
	});

	describe("listSessions", () => {
		it("should return sessions for the current actor", async () => {
			mockAuthService.listSessions.mockResolvedValue({ sessions: [] });
			const actor = { id: "u-1", sessionId: "s-1", userType: UserType.BUSINESS, walletAddress: "0xabc", chainId: 8453, kycStatus: VentairyKycStatus.PENDING };

			await controller.listSessions(actor);

			expect(mockAuthService.listSessions).toHaveBeenCalledWith("u-1", "s-1");
		});
	});

	describe("revokeSession", () => {
		it("should clear cookies when revoking own session", async () => {
			mockAuthService.revokeSession.mockResolvedValue({ isCurrentSession: true });
			const mockRes = createMockResponse();
			const actor = { id: "u-1", sessionId: "s-1", userType: UserType.BUSINESS, walletAddress: "0xabc", chainId: 8453, kycStatus: VentairyKycStatus.PENDING };

			await controller.revokeSession(actor, "s-1", mockRes as any);

			expect(mockRes.clearCookie).toHaveBeenCalledTimes(2);
		});

		it("should not clear cookies when revoking another session", async () => {
			mockAuthService.revokeSession.mockResolvedValue({ isCurrentSession: false });
			const mockRes = createMockResponse();
			const actor = { id: "u-1", sessionId: "s-1", userType: UserType.BUSINESS, walletAddress: "0xabc", chainId: 8453, kycStatus: VentairyKycStatus.PENDING };

			await controller.revokeSession(actor, "s-2", mockRes as any);

			expect(mockRes.clearCookie).not.toHaveBeenCalled();
		});
	});

	describe("logoutOthers", () => {
		it("should call authService.logoutOthers and clear cookies", async () => {
			const mockRes = createMockResponse();
			const actor = { id: "u-1", sessionId: "s-1", userType: UserType.BUSINESS, walletAddress: "0xabc", chainId: 8453, kycStatus: VentairyKycStatus.PENDING };

			await controller.logoutOthers(actor, mockRes as any);

			expect(mockAuthService.logoutOthers).toHaveBeenCalledWith("u-1", "s-1");
			expect(mockRes.clearCookie).toHaveBeenCalledTimes(2);
		});
	});
});
