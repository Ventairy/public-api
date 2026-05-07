import { describe, it, expect } from "vitest";
import { BusinessFileType } from "../business-file-type";

describe("BusinessFileType", () => {
	it("should have correct values", () => {
		expect(BusinessFileType.PROOF_OF_ADDRESS).toBe("PROOF_OF_ADDRESS");
		expect(BusinessFileType.INCORPORATION_DOCUMENT).toBe("INCORPORATION_DOCUMENT");
		expect(BusinessFileType.PROOF_OF_OWNERSHIP).toBe("PROOF_OF_OWNERSHIP");
	});

	it("should have exactly 3 members", () => {
		expect(Object.keys(BusinessFileType)).toHaveLength(3);
	});
});
