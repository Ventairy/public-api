import { describe, it, expect } from "vitest";
import { BusinessControllerFileType } from "../business-controller-file-type";

describe("BusinessControllerFileType", () => {
	it("should have correct values", () => {
		expect(BusinessControllerFileType.IDENTIFICATION_FRONT).toBe("IDENTIFICATION_FRONT");
		expect(BusinessControllerFileType.IDENTIFICATION_BACK).toBe("IDENTIFICATION_BACK");
		expect(BusinessControllerFileType.PROOF_OF_ADDRESS).toBe("PROOF_OF_ADDRESS");
	});

	it("should have exactly 3 members", () => {
		expect(Object.keys(BusinessControllerFileType)).toHaveLength(3);
	});
});
