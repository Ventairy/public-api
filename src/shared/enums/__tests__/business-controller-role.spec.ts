import { describe, it, expect } from "vitest";
import { BusinessControllerRole } from "../business-controller-role";

describe("BusinessControllerRole", () => {
	it("should have correct values", () => {
		expect(BusinessControllerRole.BENEFICIAL_OWNER).toBe("BENEFICIAL_OWNER");
		expect(BusinessControllerRole.CONTROLLING_PERSON).toBe("CONTROLLING_PERSON");
		expect(BusinessControllerRole.BENEFICIAL_OWNER_AND_CONTROLLING_PERSON).toBe(
			"BENEFICIAL_OWNER_AND_CONTROLLING_PERSON",
		);
	});

	it("should have exactly 3 members", () => {
		expect(Object.keys(BusinessControllerRole)).toHaveLength(3);
	});
});
