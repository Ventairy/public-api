import "reflect-metadata";
import { describe, it, expect } from "vitest";
import { RequiredForVerification, REQUIRED_FOR_VERIFICATION_DECORATOR_KEY } from "../required-for-verification.decorator";
import { UserType } from "@shared/enums/user-type";

describe("RequiredForVerification", () => {
	it("should store metadata on the class constructor", () => {
		class TestDto {
			@RequiredForVerification([UserType.BUSINESS])
			legalName?: string;
		}

		const metadata = Reflect.getOwnMetadata(REQUIRED_FOR_VERIFICATION_DECORATOR_KEY, TestDto);

		expect(metadata).toBeDefined();
		expect(metadata).toHaveLength(1);
		expect(metadata[0]).toEqual({
			propertyKey: "legalName",
			userTypes: [UserType.BUSINESS],
		});
	});

	it("should accumulate metadata from multiple properties", () => {
		class TestDto {
			@RequiredForVerification([UserType.BUSINESS])
			legalName?: string;

			@RequiredForVerification([UserType.BUSINESS])
			formationDate?: string;
		}

		const metadata = Reflect.getOwnMetadata(REQUIRED_FOR_VERIFICATION_DECORATOR_KEY, TestDto);

		expect(metadata).toHaveLength(2);
		expect(metadata).toContainEqual({
			propertyKey: "legalName",
			userTypes: [UserType.BUSINESS],
		});
		expect(metadata).toContainEqual({
			propertyKey: "formationDate",
			userTypes: [UserType.BUSINESS],
		});
	});

	it("should store metadata for different user types", () => {
		class TestDto {
			@RequiredForVerification([UserType.BUSINESS])
			legalName?: string;
		}

		const metadata = Reflect.getOwnMetadata(REQUIRED_FOR_VERIFICATION_DECORATOR_KEY, TestDto);

		expect(metadata[0].userTypes).toEqual([UserType.BUSINESS]);
	});
});
