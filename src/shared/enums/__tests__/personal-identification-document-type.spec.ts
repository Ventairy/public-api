import { describe, it, expect } from "vitest";
import { PersonalIdentificationDocumentType } from "../personal-identification-document-type";

describe("PersonalIdentificationDocumentType", () => {
	it("should have correct values", () => {
		expect(PersonalIdentificationDocumentType.PASSPORT).toBe("PASSPORT");
		expect(PersonalIdentificationDocumentType.ID_CARD).toBe("ID_CARD");
		expect(PersonalIdentificationDocumentType.DRIVERS_LICENSE).toBe("DRIVERS_LICENSE");
	});

	it("should have exactly 3 members", () => {
		expect(Object.keys(PersonalIdentificationDocumentType)).toHaveLength(3);
	});
});
