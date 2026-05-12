import "reflect-metadata";
import { describe, it, expect } from "vitest";
import { RequiredForKYC, REQUIRED_FOR_KYC_DECORATOR_KEY } from "../required-for-kyc.decorator";
import { UserType } from "@shared/enums/user-type";

describe("RequiredForKYC", () => {
	it("should store metadata on the class constructor", () => {
		class TestDto {
			@RequiredForKYC([UserType.BUSINESS])
			legalName?: string;
		}

		const metadata = Reflect.getOwnMetadata(REQUIRED_FOR_KYC_DECORATOR_KEY, TestDto);

		expect(metadata).toBeDefined();
		expect(metadata).toHaveLength(1);
		expect(metadata[0]).toEqual({
			propertyKey: "legalName",
			userTypes: [UserType.BUSINESS],
		});
	});

	it("should accumulate metadata from multiple properties", () => {
		class TestDto {
			@RequiredForKYC([UserType.BUSINESS])
			legalName?: string;

			@RequiredForKYC([UserType.BUSINESS])
			formationDate?: string;
		}

		const metadata = Reflect.getOwnMetadata(REQUIRED_FOR_KYC_DECORATOR_KEY, TestDto);

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
			@RequiredForKYC([UserType.BUSINESS])
			legalName?: string;
		}

		const metadata = Reflect.getOwnMetadata(REQUIRED_FOR_KYC_DECORATOR_KEY, TestDto);

		expect(metadata[0].userTypes).toEqual([UserType.BUSINESS]);
	});
});
