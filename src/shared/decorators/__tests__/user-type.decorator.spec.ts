import { describe, it, expect } from "vitest";
import { UserType } from "@shared/enums/user-type";
import { BusinessUserOnly, ALLOWED_USER_TYPES_DECORATOR_KEY } from "../user-type.decorator";

describe("BusinessUserOnly", () => {
	it("should set metadata with allowedUserTypes key and BUSINESS value", () => {
		const decorator = BusinessUserOnly();

		expect(decorator).toBeDefined();
		expect(typeof decorator).toBe("function");

		const target = function () {};
		decorator(target);

		const metadata = Reflect.getMetadata(ALLOWED_USER_TYPES_DECORATOR_KEY, target);
		expect(metadata).toEqual([UserType.BUSINESS]);
	});
});
