import { describe, it, expect, vi } from "vitest";
import { CookieUtils } from "./cookie.utils";

function createMockResponse() {
	const calls: unknown[] = [];
	return {
		cookie: vi.fn().mockImplementation((name: string, value: string, options: unknown) => {
			calls.push({ name, value, options });
		}),
		clearCookie: vi.fn(),
		calls,
	};
}

describe("CookieUtils", () => {
	describe("setAuthCookies", () => {
		it("should set access and refresh cookies with correct names", () => {
			const res = createMockResponse();

			CookieUtils.setAuthCookies(res as any, {
				accessToken: "access-123",
				refreshToken: "refresh-456",
			});

			expect(res.cookie).toHaveBeenCalledTimes(2);
			expect(res.cookie).toHaveBeenCalledWith(
				"__Host-ventairy-access",
				"access-123",
				expect.any(Object),
			);
			expect(res.cookie).toHaveBeenCalledWith(
				"__Host-ventairy-refresh",
				"refresh-456",
				expect.any(Object),
			);
		});

		it("should set httpOnly, secure, sameSite strict on both cookies", () => {
			const res = createMockResponse();

			CookieUtils.setAuthCookies(res as any, {
				accessToken: "tok",
				refreshToken: "tok",
			});

			const accessCall = res.cookie.mock.calls[0] as [string, string, Record<string, unknown>];
			const refreshCall = res.cookie.mock.calls[1] as [string, string, Record<string, unknown>];

			expect(accessCall[2]).toMatchObject({
				httpOnly: true,
				secure: true,
				sameSite: "strict",
				path: "/",
			});
			expect(refreshCall[2]).toMatchObject({
				httpOnly: true,
				secure: true,
				sameSite: "strict",
				path: "/",
			});
		});

		it("should set maxAge based on TTL constants", () => {
			const res = createMockResponse();

			CookieUtils.setAuthCookies(res as any, {
				accessToken: "tok",
				refreshToken: "tok",
			});

			const accessOptions = res.cookie.mock.calls[0]![2] as Record<string, unknown>;
			const refreshOptions = res.cookie.mock.calls[1]![2] as Record<string, unknown>;

			expect(accessOptions).toHaveProperty("maxAge");
			expect(refreshOptions).toHaveProperty("maxAge");
			expect(accessOptions["maxAge"] as number).toBeLessThan(refreshOptions["maxAge"] as number);
		});
	});

	describe("extractCookie", () => {
		const validCookieHeader = "__Host-ventairy-access=abc123; __Host-ventairy-refresh=xyz789; other=val";

		it("should return the value for a matching cookie name", () => {
			const request = { headers: { cookie: validCookieHeader } } as any;

			const result = CookieUtils.extractCookie(request, "__Host-ventairy-refresh");

			expect(result).toBe("xyz789");
		});

		it("should return null when no cookie header is present", () => {
			const request = { headers: {} } as any;

			const result = CookieUtils.extractCookie(request, "__Host-ventairy-access");

			expect(result).toBeNull();
		});

		it("should return null when the named cookie is not found", () => {
			const request = { headers: { cookie: "other=val" } } as any;

			const result = CookieUtils.extractCookie(request, "nonexistent");

			expect(result).toBeNull();
		});

		it("should handle cookie values containing equals signs", () => {
			const complexValue = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature";
			const request = { headers: { cookie: `token=${complexValue}` } } as any;

			const result = CookieUtils.extractCookie(request, "token");

			expect(result).toBe(complexValue);
		});
	});

	describe("clearAuthCookies", () => {
		it("should clear both access and refresh cookies", () => {
			const res = createMockResponse();

			CookieUtils.clearAuthCookies(res as any);

			expect(res.clearCookie).toHaveBeenCalledTimes(2);
			expect(res.clearCookie).toHaveBeenCalledWith("__Host-ventairy-access", {
				httpOnly: true,
				secure: true,
				sameSite: "strict",
				path: "/",
			});
			expect(res.clearCookie).toHaveBeenCalledWith("__Host-ventairy-refresh", {
				httpOnly: true,
				secure: true,
				sameSite: "strict",
				path: "/",
			});
		});

		it("regression: __Host- cookies require secure flag on clearCookie or browser rejects deletion", () => {
			const res = createMockResponse();

			CookieUtils.clearAuthCookies(res as any);

			const accessCall = res.clearCookie.mock.calls[0] as [string, Record<string, unknown>];
			const refreshCall = res.clearCookie.mock.calls[1] as [string, Record<string, unknown>];

			expect(accessCall[1]).toMatchObject({
				secure: true,
				sameSite: "strict",
				httpOnly: true,
				path: "/",
			});
			expect(refreshCall[1]).toMatchObject({
				secure: true,
				sameSite: "strict",
				httpOnly: true,
				path: "/",
			});
		});
	});
});
