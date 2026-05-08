import { describe, it, expect } from "vitest";
import { MimeType } from "../mime-type";

describe("MimeType", () => {
	it("should have correct values", () => {
		expect(MimeType.PDF).toBe("application/pdf");
		expect(MimeType.JPEG).toBe("image/jpeg");
		expect(MimeType.PNG).toBe("image/png");
		expect(MimeType.HEIC).toBe("image/heic");
		expect(MimeType.WEBP).toBe("image/webp");
		expect(MimeType.AVIF).toBe("image/avif");
	});

	it("should have exactly 6 members", () => {
		expect(Object.keys(MimeType)).toHaveLength(6);
	});
});
