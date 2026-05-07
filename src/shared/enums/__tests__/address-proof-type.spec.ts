import { describe, it, expect } from "vitest";
import { AddressProofType } from "../address-proof-type";

describe("AddressProofType", () => {
	it("should have correct values", () => {
		expect(AddressProofType.UTILITY_BILL).toBe("UTILITY_BILL");
		expect(AddressProofType.BANK_STATEMENT).toBe("BANK_STATEMENT");
		expect(AddressProofType.TAX_RETURN).toBe("TAX_RETURN");
		expect(AddressProofType.GOVERNMENT_ISSUED_LETTER).toBe("GOVERNMENT_ISSUED_LETTER");
		expect(AddressProofType.LEASE_AGREEMENT).toBe("LEASE_AGREEMENT");
		expect(AddressProofType.OTHER).toBe("OTHER");
	});

	it("should have exactly 6 members", () => {
		expect(Object.keys(AddressProofType)).toHaveLength(6);
	});
});
