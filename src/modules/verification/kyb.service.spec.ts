import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserType, BusinessFileType, BusinessControllerFileType, ControllerRole } from "@shared/enums";
import { BusinessNotFoundException } from "@shared/exceptions/business-not-found.exception";
import { KybService } from "./kyb.service";
import type { Actor } from "@shared/types/actor.type";

const MOCK_USER_ID = "user-123";
const MOCK_ACTOR: Actor = { id: MOCK_USER_ID, sessionId: "session-1", userType: UserType.BUSINESS, walletAddress: "0xabc", chainId: 8453 };

function createMockBusinessOutput(overrides: Record<string, unknown> = {}) {
	const defaults = {
		id: "biz-1",
		legalName: "Acme Corp",
		fantasyName: "Acme",
		formationDate: "2020-01-15",
		email: "contact@acme.com",
		taxId: "12.345.678/0001-90",
		phoneNumber: "+5511999990000",
		website: "https://acme.com",
		address: {
			countryCode: "BR",
			street: "Rua Exemplo, 123",
			city: "São Paulo",
			state: "SP",
			postalCode: "01001-000",
			addressProofType: "UTILITY_BILL",
		},
		fileTypesUploaded: [] as BusinessFileType[],
		controllers: [] as Array<Record<string, unknown>>,
		createdAt: "2026-01-01T00:00:00.000Z",
	};

	return { ...defaults, ...overrides };
}

function createMockController(overrides: Record<string, unknown> = {}) {
	return {
		id: "ctrl-1",
		role: ControllerRole.BENEFICIAL_OWNER_AND_CONTROLLING_PERSON,
		ownershipPercentage: 50,
		title: "CEO",
		legalFirstName: "John",
		legalLastName: "Doe",
		dateOfBirth: "1985-03-15",
		taxId: "123.456.789-00",
		identification: {
			countryCode: "BR",
			documentType: "PASSPORT",
		},
		address: {
			countryCode: "BR",
			street: "Rua do Controlador, 456",
			city: "São Paulo",
			state: "SP",
			postalCode: "02002-000",
			addressProofType: "BANK_STATEMENT",
		},
		fileTypesUploaded: [] as BusinessControllerFileType[],
		...overrides,
	};
}

describe("KybService", () => {
	let service: KybService;
	let mockBusinessService: any;

	beforeEach(() => {
		mockBusinessService = {
			getBusiness: vi.fn().mockResolvedValue(createMockBusinessOutput()),
		};

		service = new KybService(mockBusinessService);
	});

	describe("getKybMissingData", () => {
		it("should return non-controller fields plus business.controllers when no business exists", async () => {
			mockBusinessService.getBusiness.mockRejectedValue(new BusinessNotFoundException(MOCK_USER_ID));

			const result = await service.getKybMissingData(MOCK_ACTOR, "null");

			expect(result.fields).toContain("business.legal_name");
			expect(result.fields).toContain("business.controllers");
			expect(result.fields).not.toContain("business.controllers.role");
			expect(result.fields).not.toContain("business.controllers.legal_first_name");

			expect(mockBusinessService.getBusiness).toHaveBeenCalledWith(MOCK_USER_ID);
		});

		it("should return missing top-level business info fields", async () => {
			mockBusinessService.getBusiness.mockResolvedValue(
				createMockBusinessOutput({
					legalName: null,
					formationDate: "2020-01-15",
					email: null,
					taxId: "12.345.678/0001-90",
					phoneNumber: null,
					website: "https://acme.com",
					address: null,
					controllers: [],
					fileTypesUploaded: [],
				}),
			);

			const result = await service.getKybMissingData(MOCK_ACTOR, "throw");

			expect(result.fields).toContain("business.legal_name");
			expect(result.fields).toContain("business.email");
			expect(result.fields).toContain("business.phone_number");
			expect(result.fields).not.toContain("business.formation_date");
			expect(result.fields).not.toContain("business.website");
			expect(result.fields).toContain("business.controllers");
		});

		it("should return missing nested address fields", async () => {
			mockBusinessService.getBusiness.mockResolvedValue(
				createMockBusinessOutput({
					legalName: "Acme Corp",
					formationDate: "2020-01-15",
					email: "contact@acme.com",
					taxId: "12.345.678/0001-90",
					phoneNumber: "+5511999990000",
					website: "https://acme.com",
					address: {
						countryCode: "BR",
						street: null,
						city: null,
						state: "SP",
						postalCode: "01001-000",
						addressProofType: "UTILITY_BILL",
					},
					controllers: [],
					fileTypesUploaded: [],
				}),
			);

			const result = await service.getKybMissingData(MOCK_ACTOR, "throw");

			expect(result.fields).toContain("business.address.street");
			expect(result.fields).toContain("business.address.city");
			expect(result.fields).not.toContain("business.address.country_code");
		});

		it("should return business.controllers when controllers array is empty", async () => {
			mockBusinessService.getBusiness.mockResolvedValue(
				createMockBusinessOutput({
					legalName: "Acme Corp",
					formationDate: "2020-01-15",
					email: "contact@acme.com",
					taxId: "12.345.678/0001-90",
					phoneNumber: "+5511999990000",
					website: "https://acme.com",
					address: {
						countryCode: "BR",
						street: "Rua Exemplo, 123",
						city: "São Paulo",
						state: "SP",
						postalCode: "01001-000",
						addressProofType: "UTILITY_BILL",
					},
					controllers: [],
					fileTypesUploaded: [],
				}),
			);

			const result = await service.getKybMissingData(MOCK_ACTOR, "throw");

			expect(result.fields).toContain("business.controllers");
			expect(result.fields).not.toContain("business.controllers.role");
		});

		it("should return per-controller missing fields with controller ID prefix", async () => {
			mockBusinessService.getBusiness.mockResolvedValue(
				createMockBusinessOutput({
					controllers: [createMockController({
						legalFirstName: null,
						legalLastName: null,
						dateOfBirth: null,
						identification: {
							countryCode: "BR",
							documentType: null,
						},
						address: {
							countryCode: "BR",
							street: "Rua do Controlador, 456",
							city: "São Paulo",
							state: "SP",
							postalCode: "02002-000",
							addressProofType: null,
						},
					})],
				}),
			);

			const result = await service.getKybMissingData(MOCK_ACTOR, "throw");

			expect(result.fields).toContain("business.controllers.ctrl-1.legal_first_name");
			expect(result.fields).toContain("business.controllers.ctrl-1.date_of_birth");
			expect(result.fields).toContain("business.controllers.ctrl-1.identification.document_type");
			expect(result.fields).toContain("business.controllers.ctrl-1.address.address_proof_type");
			expect(result.fields).not.toContain("business.controllers.ctrl-1.role");
			expect(result.fields).not.toContain("business.controllers.ctrl-1.tax_id");
		});

		it("should set missing files when business-level files are missing", async () => {
			mockBusinessService.getBusiness.mockResolvedValue(
				createMockBusinessOutput({
					legalName: "Acme Corp",
					formationDate: "2020-01-15",
					email: "contact@acme.com",
					taxId: "12.345.678/0001-90",
					phoneNumber: "+5511999990000",
					website: "https://acme.com",
					address: {
						countryCode: "BR",
						street: "Rua Exemplo, 123",
						city: "São Paulo",
						state: "SP",
						postalCode: "01001-000",
						addressProofType: "UTILITY_BILL",
					},
					controllers: [],
					fileTypesUploaded: [],
				}),
			);

			const result = await service.getKybMissingData(MOCK_ACTOR, "throw");

			expect(result.files).toContain("business.PROOF_OF_ADDRESS");
			expect(result.files).toContain("business.INCORPORATION_DOCUMENT");
			expect(result.files).toContain("business.PROOF_OF_OWNERSHIP");
		});

		it("should set can_submit to true when all data and files are provided", async () => {
			mockBusinessService.getBusiness.mockResolvedValue(
				createMockBusinessOutput({
					legalName: "Acme Corp",
					formationDate: "2020-01-15",
					email: "contact@acme.com",
					taxId: "12.345.678/0001-90",
					phoneNumber: "+5511999990000",
					website: "https://acme.com",
					address: {
						countryCode: "BR",
						street: "Rua Exemplo, 123",
						city: "São Paulo",
						state: "SP",
						postalCode: "01001-000",
						addressProofType: "UTILITY_BILL",
					},
					fileTypesUploaded: [
						BusinessFileType.PROOF_OF_ADDRESS,
						BusinessFileType.INCORPORATION_DOCUMENT,
						BusinessFileType.PROOF_OF_OWNERSHIP,
					],
					controllers: [createMockController({
						fileTypesUploaded: [
							BusinessControllerFileType.IDENTIFICATION_FRONT,
							BusinessControllerFileType.PROOF_OF_ADDRESS,
						],
					})],
				}),
			);

			const result = await service.getKybMissingData(MOCK_ACTOR, "throw");

			expect(result.fields).toHaveLength(0);
			expect(result.files).toHaveLength(0);
		});

		it("should list missing controller files with business prefix and controller ID", async () => {
			mockBusinessService.getBusiness.mockResolvedValue(
				createMockBusinessOutput({
					legalName: "Acme Corp",
					formationDate: "2020-01-15",
					email: "contact@acme.com",
					taxId: "12.345.678/0001-90",
					phoneNumber: "+5511999990000",
					website: "https://acme.com",
					address: {
						countryCode: "BR",
						street: "Rua Exemplo, 123",
						city: "São Paulo",
						state: "SP",
						postalCode: "01001-000",
						addressProofType: "UTILITY_BILL",
					},
					fileTypesUploaded: [
						BusinessFileType.PROOF_OF_ADDRESS,
						BusinessFileType.INCORPORATION_DOCUMENT,
						BusinessFileType.PROOF_OF_OWNERSHIP,
					],
					controllers: [createMockController({
						fileTypesUploaded: [BusinessControllerFileType.IDENTIFICATION_FRONT],
					})],
				}),
			);

			const result = await service.getKybMissingData(MOCK_ACTOR, "throw");

			expect(result.files).toContain("business.controllers.ctrl-1.PROOF_OF_ADDRESS");
			expect(result.files).not.toContain("business.controllers.ctrl-1.IDENTIFICATION_FRONT");
		});
	});
});