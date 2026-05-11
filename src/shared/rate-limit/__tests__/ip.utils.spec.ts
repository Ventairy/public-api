import { describe, it, expect } from "vitest";
import { IpUtils } from "../ip.utils";

function createMockRequest(
	headers: Record<string, string | string[] | undefined>,
	ip?: string,
) {
	return { headers, ip };
}

describe("IpUtils", () => {
	describe("extractClientIp", () => {
		it("should return CF-Connecting-IP when present", () => {
			const req = createMockRequest({
				"cf-connecting-ip": "1.2.3.4",
				"x-forwarded-for": "5.6.7.8",
			});
			expect(IpUtils.extractClientIp(req)).toBe("1.2.3.4");
		});

		it("should fall back to X-Forwarded-For when CF-Connecting-IP is absent", () => {
			const req = createMockRequest({ "x-forwarded-for": "10.0.0.1" });
			expect(IpUtils.extractClientIp(req)).toBe("10.0.0.1");
		});

		it("should take the first IP from X-Forwarded-For when multiple are present", () => {
			const req = createMockRequest({
				"x-forwarded-for": "10.0.0.1, 10.0.0.2, 10.0.0.3",
			});
			expect(IpUtils.extractClientIp(req)).toBe("10.0.0.1");
		});

		it("should fall back to req.ip when headers are absent", () => {
			const req = createMockRequest({}, "192.168.1.1");
			expect(IpUtils.extractClientIp(req)).toBe("192.168.1.1");
		});

		it("should return 'unknown' when no IP source is available", () => {
			const req = createMockRequest({});
			expect(IpUtils.extractClientIp(req)).toBe("unknown");
		});

		it("should handle empty CF-Connecting-IP string by falling through to X-Forwarded-For", () => {
			const req = createMockRequest({
				"cf-connecting-ip": "",
				"x-forwarded-for": "10.0.0.1",
			});
			expect(IpUtils.extractClientIp(req)).toBe("10.0.0.1");
		});
	});
});
