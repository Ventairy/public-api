import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserType, BusinessFileType, BusinessControllerFileType, ControllerRole } from "@shared/enums";
import { VentairyKycStatus } from "@shared/enums/ventairy-kyc-status";
import { KycSubmissionLockedException } from "@shared/exceptions/kyc-submission-locked.exception";
import { KycSubmissionRequirementsNotMetException } from "@shared/exceptions/kyc-submission-requirements-not-met.exception";
import { UserKycNotFoundException } from "@shared/exceptions/user-kyc-not-found.exception";
import { BusinessNotFoundException } from "@shared/exceptions/business-not-found.exception";
import { KycService } from "./kyc.service";
import type { Actor } from "@shared/types/actor.type";

const MOCK_USER_ID = "user-123";
const MOCK_ACTOR: Actor = { id: MOCK_USER_ID, sessionId: "session-1", userType: UserType.BUSINESS, walletAddress: "0xabc", chainId: 8453, kycStatus: VentairyKycStatus.APPROVED };

function createMockKyc(overrides: Record<string, unknown> = {}) {
	return {
		id: "kyc-001",
		user_id: MOCK_USER_ID,
		ventairy_kyc_status: VentairyKycStatus.PENDING,
		kyc_submitted_at: null as string | null,
		created_at: "2026-05-04T14:48:00.000Z",
		...overrides,
	};
}

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

describe("KycService", () => {
	let service: KycService;
	let mockKycRepository: any;
	let mockBusinessService: any;

	beforeEach(() => {
		mockKycRepository = {
			findByUserId: vi.fn(),
			getKycStatus: vi.fn(),
			create: vi.fn(),
			updateStatusByUserId: vi.fn(),
		} as any;

		mockBusinessService = {
			getBusiness: vi.fn().mockResolvedValue(createMockBusinessOutput() as any),
		} as any;

		service = new KycService(mockKycRepository, mockBusinessService);
	});

	describe("submitKyc", () => {
		it("should throw UserKycNotFoundException when user has no kyc record", async () => {
			mockKycRepository.getKycStatus.mockRejectedValue(new UserKycNotFoundException(MOCK_USER_ID));

			await expect(service.submitKyc(MOCK_ACTOR)).rejects.toThrow(UserKycNotFoundException);
		});

		it("should throw KycSubmissionLockedException when user is APPROVED", async () => {
			mockKycRepository.getKycStatus.mockResolvedValue(VentairyKycStatus.APPROVED);

			await expect(service.submitKyc(MOCK_ACTOR)).rejects.toThrow(KycSubmissionLockedException);

			expect(mockKycRepository.getKycStatus).toHaveBeenCalledWith(MOCK_USER_ID);
		});

		it("should throw KycSubmissionLockedException when user is REJECTED", async () => {
			mockKycRepository.getKycStatus.mockResolvedValue(VentairyKycStatus.REJECTED);

			await expect(service.submitKyc(MOCK_ACTOR)).rejects.toThrow(KycSubmissionLockedException);

			expect(mockKycRepository.getKycStatus).toHaveBeenCalledWith(MOCK_USER_ID);
		});

		it("should throw KycSubmissionRequirementsNotMetException when required fields are missing", async () => {
			mockKycRepository.getKycStatus.mockResolvedValue(VentairyKycStatus.PENDING);

			mockBusinessService.getBusiness.mockResolvedValue(
				createMockBusinessOutput({ legalName: null, email: null, phoneNumber: null, address: null, controllers: [], fileTypesUploaded: [] }) as any,
			);

			await expect(service.submitKyc(MOCK_ACTOR)).rejects.toThrow(KycSubmissionRequirementsNotMetException);

			expect(mockKycRepository.getKycStatus).toHaveBeenCalledWith(MOCK_USER_ID);
		});

		it("should throw KycSubmissionRequirementsNotMetException when required files are missing", async () => {
			mockKycRepository.getKycStatus.mockResolvedValue(VentairyKycStatus.PENDING);

			const mockController = createMockController({
				fileTypesUploaded: [],
			});

			mockBusinessService.getBusiness.mockResolvedValue(
				createMockBusinessOutput({
					controllers: [mockController],
					fileTypesUploaded: [],
				}) as any,
			);

			await expect(service.submitKyc(MOCK_ACTOR)).rejects.toThrow(KycSubmissionRequirementsNotMetException);

			expect(mockKycRepository.getKycStatus).toHaveBeenCalledWith(MOCK_USER_ID);
		});

		it("should include missing details in KycSubmissionRequirementsNotMetException", async () => {
			mockKycRepository.getKycStatus.mockResolvedValue(VentairyKycStatus.PENDING);

			mockBusinessService.getBusiness.mockResolvedValue(
				createMockBusinessOutput({ legalName: null, controllers: [], fileTypesUploaded: [] }) as any,
			);

			let thrownError: KycSubmissionRequirementsNotMetException | undefined;
			try {
				await service.submitKyc(MOCK_ACTOR);
			} catch (error) {
				thrownError = error as KycSubmissionRequirementsNotMetException;
			}

			expect(thrownError).toBeDefined();
			expect(thrownError!.details!["missing"]).toHaveProperty("fields");
			expect(thrownError!.details!["missing"]).toHaveProperty("files");
		});

		it("should update kyc status to VERIFYING on successful submit", async () => {
			const updatedKyc = createMockKyc({
				ventairy_kyc_status: VentairyKycStatus.VERIFYING,
				kyc_submitted_at: "2026-05-05T10:00:00.000Z",
			});

			mockKycRepository.getKycStatus.mockResolvedValue(VentairyKycStatus.PENDING);
			mockKycRepository.updateStatusByUserId.mockResolvedValue(updatedKyc as any);

			const mockController = createMockController({
				fileTypesUploaded: [
					BusinessControllerFileType.IDENTIFICATION_FRONT,
					BusinessControllerFileType.PROOF_OF_ADDRESS,
				],
			});

			mockBusinessService.getBusiness.mockResolvedValue(
				createMockBusinessOutput({
					fileTypesUploaded: [
						BusinessFileType.PROOF_OF_ADDRESS,
						BusinessFileType.INCORPORATION_DOCUMENT,
						BusinessFileType.PROOF_OF_OWNERSHIP,
					],
					controllers: [mockController],
				}) as any,
			);

			const result = await service.submitKyc(MOCK_ACTOR);

			expect(mockKycRepository.updateStatusByUserId).toHaveBeenCalledWith({
				userId: MOCK_USER_ID,
				status: VentairyKycStatus.VERIFYING,
				submittedAt: expect.any(String),
			});
			expect(result.ventairyKycStatus).toBe(VentairyKycStatus.VERIFYING);
			expect(result.userId).toBe(MOCK_USER_ID);

			expect(mockKycRepository.getKycStatus).toHaveBeenCalledWith(MOCK_USER_ID);
		});
	});

	describe("getKycStatus", () => {
		it("should throw UserKycNotFoundException when user has no kyc record", async () => {
			mockKycRepository.findByUserId.mockResolvedValue(undefined);

			await expect(service.getKycStatus(MOCK_ACTOR)).rejects.toThrow(UserKycNotFoundException);
		});

		it("should return non-controller fields plus business.controllers when no business exists", async () => {
			mockKycRepository.findByUserId.mockResolvedValue(createMockKyc() as any);
			mockBusinessService.getBusiness.mockRejectedValue(new BusinessNotFoundException(MOCK_USER_ID));

			const result = await service.getKycStatus(MOCK_ACTOR);

			expect(result.ventairyKycStatus).toBe(VentairyKycStatus.PENDING);
			expect(result.canSubmitKyc).toBe(false);
			expect(result.missing.fields).toContain("business.legal_name");
			expect(result.missing.fields).toContain("business.controllers");
			expect(result.missing.fields).not.toContain("business.controllers.role");
			expect(result.missing.fields).not.toContain("business.controllers.legal_first_name");

			expect(mockKycRepository.findByUserId).toHaveBeenCalledWith(MOCK_USER_ID);
		});

		it("should return VERIFYING status when user has kyc_submitted_at", async () => {
			const mockKyc = createMockKyc({
				kyc_submitted_at: "2026-05-05T10:00:00.000Z",
				ventairy_kyc_status: VentairyKycStatus.VERIFYING,
			});
			mockKycRepository.findByUserId.mockResolvedValue(mockKyc as any);

			const result = await service.getKycStatus(MOCK_ACTOR);

			expect(result.ventairyKycStatus).toBe(VentairyKycStatus.VERIFYING);
			expect(result.submittedAt).toBe("2026-05-05T10:00:00.000Z");

			expect(mockKycRepository.findByUserId).toHaveBeenCalledWith(MOCK_USER_ID);
		});

		it("should return missing top-level business info fields", async () => {
			const mockBusiness = createMockBusinessOutput({
				legalName: null,
				formationDate: "2020-01-15",
				email: null,
				taxId: "12.345.678/0001-90",
				phoneNumber: null,
				website: "https://acme.com",
				address: null,
				controllers: [],
				fileTypesUploaded: [],
			});

			mockKycRepository.findByUserId.mockResolvedValue(createMockKyc() as any);
			mockBusinessService.getBusiness.mockResolvedValue(mockBusiness);

			const result = await service.getKycStatus(MOCK_ACTOR);

			expect(result.canSubmitKyc).toBe(false);
			expect(result.missing.fields).toContain("business.legal_name");
			expect(result.missing.fields).toContain("business.email");
			expect(result.missing.fields).toContain("business.phone_number");
			expect(result.missing.fields).not.toContain("business.formation_date");
			expect(result.missing.fields).not.toContain("business.website");
			expect(result.missing.fields).toContain("business.controllers");
		});

		it("should return missing nested address fields", async () => {
			const mockBusiness = createMockBusinessOutput({
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
			});

			mockKycRepository.findByUserId.mockResolvedValue(createMockKyc() as any);
			mockBusinessService.getBusiness.mockResolvedValue(mockBusiness);

			const result = await service.getKycStatus(MOCK_ACTOR);

			expect(result.missing.fields).toContain("business.address.street");
			expect(result.missing.fields).toContain("business.address.city");
			expect(result.missing.fields).not.toContain("business.address.country_code");
		});

		it("should return business.controllers when controllers array is empty", async () => {
			const mockBusiness = createMockBusinessOutput({
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
			});

			mockKycRepository.findByUserId.mockResolvedValue(createMockKyc() as any);
			mockBusinessService.getBusiness.mockResolvedValue(mockBusiness);

			const result = await service.getKycStatus(MOCK_ACTOR);

			expect(result.missing.fields).toContain("business.controllers");
			expect(result.missing.fields).not.toContain("business.controllers.role");
		});

		it("should return per-controller missing fields with controller ID prefix", async () => {
			const mockController = createMockController({
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
			});

			const mockBusiness = createMockBusinessOutput({
				controllers: [mockController],
			});

			mockKycRepository.findByUserId.mockResolvedValue(createMockKyc() as any);
			mockBusinessService.getBusiness.mockResolvedValue(mockBusiness);

			const result = await service.getKycStatus(MOCK_ACTOR);

			expect(result.missing.fields).toContain("business.controllers.ctrl-1.legal_first_name");
			expect(result.missing.fields).toContain("business.controllers.ctrl-1.date_of_birth");
			expect(result.missing.fields).toContain("business.controllers.ctrl-1.identification.document_type");
			expect(result.missing.fields).toContain("business.controllers.ctrl-1.address.address_proof_type");
			expect(result.missing.fields).not.toContain("business.controllers.ctrl-1.role");
			expect(result.missing.fields).not.toContain("business.controllers.ctrl-1.tax_id");
		});

		it("should set can_submit_kyc to false when business-level files are missing", async () => {
			const mockBusiness = createMockBusinessOutput({
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
			});

			mockKycRepository.findByUserId.mockResolvedValue(createMockKyc() as any);
			mockBusinessService.getBusiness.mockResolvedValue(mockBusiness);

			const result = await service.getKycStatus(MOCK_ACTOR);

			expect(result.canSubmitKyc).toBe(false);
			expect(result.missing.files).toContain("business.PROOF_OF_ADDRESS");
			expect(result.missing.files).toContain("business.INCORPORATION_DOCUMENT");
			expect(result.missing.files).toContain("business.PROOF_OF_OWNERSHIP");
		});

		it("should set can_submit_kyc to true when all data and files are provided", async () => {
			const mockController = createMockController({
				fileTypesUploaded: [
					BusinessControllerFileType.IDENTIFICATION_FRONT,
					BusinessControllerFileType.PROOF_OF_ADDRESS,
				],
			});

			const mockBusiness = createMockBusinessOutput({
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
				controllers: [mockController],
			});

			mockKycRepository.findByUserId.mockResolvedValue(createMockKyc() as any);
			mockBusinessService.getBusiness.mockResolvedValue(mockBusiness);

			const result = await service.getKycStatus(MOCK_ACTOR);

			expect(result.canSubmitKyc).toBe(true);
			expect(result.missing.fields).toHaveLength(0);
			expect(result.missing.files).toHaveLength(0);
		});

		it("should set can_submit_kyc to false when status is not PENDING", async () => {
			mockKycRepository.findByUserId.mockResolvedValue(
				createMockKyc({ ventairy_kyc_status: VentairyKycStatus.VERIFYING }) as any,
			);
			mockBusinessService.getBusiness.mockResolvedValue(
				createMockBusinessOutput({
					fileTypesUploaded: [
						BusinessFileType.PROOF_OF_ADDRESS,
						BusinessFileType.INCORPORATION_DOCUMENT,
						BusinessFileType.PROOF_OF_OWNERSHIP,
					],
				}),
			);

			const result = await service.getKycStatus(MOCK_ACTOR);

			expect(result.ventairyKycStatus).toBe(VentairyKycStatus.VERIFYING);
			expect(result.canSubmitKyc).toBe(false);
		});

		it("should list missing controller files with business prefix and controller ID", async () => {
			const mockController = createMockController({
				fileTypesUploaded: [BusinessControllerFileType.IDENTIFICATION_FRONT],
			});

			const mockBusiness = createMockBusinessOutput({
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
				controllers: [mockController],
			});

			mockKycRepository.findByUserId.mockResolvedValue(createMockKyc() as any);
			mockBusinessService.getBusiness.mockResolvedValue(mockBusiness);

			const result = await service.getKycStatus(MOCK_ACTOR);

			expect(result.missing.files).toContain("business.controllers.ctrl-1.PROOF_OF_ADDRESS");
			expect(result.missing.files).not.toContain("business.controllers.ctrl-1.IDENTIFICATION_FRONT");
		});
	});
});
