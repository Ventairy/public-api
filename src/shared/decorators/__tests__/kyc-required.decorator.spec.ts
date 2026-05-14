import { describe, it, expect } from "vitest";
import { KYCRequired, KYC_REQUIRED_DECORATOR_KEY } from "../kyc-required.decorator";

describe("KYCRequired", () => {
	it("should set metadata with kycRequired key and true value", () => {
		const decorator = KYCRequired();

		expect(decorator).toBeDefined();
		expect(typeof decorator).toBe("function");

		const target = function () {};
		decorator(target);

		const metadata = Reflect.getMetadata(KYC_REQUIRED_DECORATOR_KEY, target);
		expect(metadata).toBe(true);
	});
});
