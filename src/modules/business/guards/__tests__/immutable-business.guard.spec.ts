import "reflect-metadata";
import { describe, it, expect, vi } from "vitest";
import { ImmutableBusinessGuard } from "../immutable-business.guard";
import { VentairyKycStatus } from "@shared/enums";
import { BusinessFieldImmutableException } from "@shared/exceptions";
import { type BusinessDatabaseRow } from "@db/schema/businesses-table";
import { type BusinessControllerDatabaseRow } from "@db/schema/business-controllers-table";

function createMockContext(overrides?: {
	actor?: { id: string; kycStatus: VentairyKycStatus };
	body?: Record<string, unknown>;
}): any {
	return {
		switchToHttp: vi.fn().mockReturnValue({
			getRequest: vi.fn().mockReturnValue({
				user: overrides?.actor,
				body: overrides?.body ?? {},
			}),
		}),
	};
}

function createMockBusinessRepository(overrides?: {
	business?: BusinessDatabaseRow | null;
	controllers?: BusinessControllerDatabaseRow[];
}): any {
	return {
		findBusinessByUserId: vi.fn().mockResolvedValue(overrides?.business ?? null),
		findControllersByBusinessId: vi.fn().mockResolvedValue(overrides?.controllers ?? []),
	};
}

function createMockKycRepository(overrides?: {
	kycStatus?: VentairyKycStatus;
	rowExists?: boolean;
}): any {
	const rowExists = overrides?.rowExists ?? true;

	return {
		getKycStatus: vi.fn().mockImplementation(() => {
			if (!rowExists) return Promise.reject(new Error(`KYC row not found for user`));
			return Promise.resolve(overrides?.kycStatus ?? VentairyKycStatus.PENDING);
		}),
	};
}

function createBusinessRow(overrides?: Partial<BusinessDatabaseRow>): BusinessDatabaseRow {
	return {
		id: "biz-1",
		legal_name: "Ventairy Inc.",
		fantasy_name: null,
		formation_date: null,
		email: null,
		tax_id: null,
		phone_number: null,
		website: null,
		country_code: null,
		street: null,
		city: null,
		state: null,
		postal_code: null,
		address_proof_type: null,
		created_at: "2026-01-01T00:00:00.000Z",
		...overrides,
	} as BusinessDatabaseRow;
}

function createControllerRow(overrides?: Partial<BusinessControllerDatabaseRow>): BusinessControllerDatabaseRow {
	return {
		id: "ctrl-1",
		business_id: "biz-1",
		role: null,
		ownership_percentage: null,
		title: null,
		legal_first_name: null,
		legal_last_name: null,
		date_of_birth: null,
		tax_id: null,
		identification_country_code: null,
		identification_document_type: null,
		address_country_code: null,
		address_street: null,
		address_city: null,
		address_state: null,
		address_postal_code: null,
		address_proof_type: null,
		created_at: "2026-01-01T00:00:00.000Z",
		...overrides,
	} as BusinessControllerDatabaseRow;
}

describe("ImmutableBusinessGuard", () => {
	describe("canActivate", () => {
		it("should allow when KYC status is PENDING", async () => {
			const guard = new ImmutableBusinessGuard(
				createMockBusinessRepository(),
				createMockKycRepository({ rowExists: true, kycStatus: VentairyKycStatus.PENDING }),
			);
			const context = createMockContext({ actor: { id: "user-1", kycStatus: VentairyKycStatus.PENDING } });

			const result = await guard.canActivate(context);
			expect(result).toBe(true);
		});

		it("should allow when KYC status is VERIFYING", async () => {
			const guard = new ImmutableBusinessGuard(
				createMockBusinessRepository(),
				createMockKycRepository({ rowExists: true, kycStatus: VentairyKycStatus.VERIFYING }),
			);
			const context = createMockContext({ actor: { id: "user-1", kycStatus: VentairyKycStatus.VERIFYING } });

			const result = await guard.canActivate(context);
			expect(result).toBe(true);
		});

		it("should allow when KYC status is REJECTED", async () => {
			const guard = new ImmutableBusinessGuard(
				createMockBusinessRepository(),
				createMockKycRepository({ rowExists: true, kycStatus: VentairyKycStatus.REJECTED }),
			);
			const context = createMockContext({ actor: { id: "user-1", kycStatus: VentairyKycStatus.REJECTED } });

			const result = await guard.canActivate(context);
			expect(result).toBe(true);
		});

		it("should allow when KYC is APPROVED but no business exists yet (create case)", async () => {
			const guard = new ImmutableBusinessGuard(
				createMockBusinessRepository({ business: null }),
				createMockKycRepository({ rowExists: true, kycStatus: VentairyKycStatus.APPROVED }),
			);
			const context = createMockContext({ actor: { id: "user-1", kycStatus: VentairyKycStatus.APPROVED } });

			const result = await guard.canActivate(context);
			expect(result).toBe(true);
		});

		it("should allow when KYC is APPROVED and no changes are made (same values)", async () => {
			const businessRow = createBusinessRow({ legal_name: "Ventairy Inc." });
			const guard = new ImmutableBusinessGuard(
				createMockBusinessRepository({ business: businessRow }),
				createMockKycRepository({ rowExists: true, kycStatus: VentairyKycStatus.APPROVED }),
			);
			const context = createMockContext({
				actor: { id: "user-1", kycStatus: VentairyKycStatus.APPROVED },
				body: { legal_name: "Ventairy Inc." },
			});

			const result = await guard.canActivate(context);
			expect(result).toBe(true);
		});

		it("should allow when KYC is APPROVED and only null fields are set (filling in unset fields)", async () => {
			const businessRow = createBusinessRow({ legal_name: "Ventairy Inc." });
			const guard = new ImmutableBusinessGuard(
				createMockBusinessRepository({ business: businessRow }),
				createMockKycRepository({ rowExists: true, kycStatus: VentairyKycStatus.APPROVED }),
			);
			const context = createMockContext({
				actor: { id: "user-1", kycStatus: VentairyKycStatus.APPROVED },
				body: { legal_name: "Ventairy Inc.", fantasy_name: "New Fantasy" },
			});

			const result = await guard.canActivate(context);
			expect(result).toBe(true);
		});

		it("should throw when KYC is APPROVED and an immutable field is changed", async () => {
			const businessRow = createBusinessRow({ legal_name: "Ventairy Inc." });
			const guard = new ImmutableBusinessGuard(
				createMockBusinessRepository({ business: businessRow }),
				createMockKycRepository({ rowExists: true, kycStatus: VentairyKycStatus.APPROVED }),
			);
			const context = createMockContext({
				actor: { id: "user-1", kycStatus: VentairyKycStatus.APPROVED },
				body: { legal_name: "Ventairy LLC" },
			});

			await expect(guard.canActivate(context)).rejects.toThrow(BusinessFieldImmutableException);
		});

		it("should throw when KYC is APPROVED and controller field is changed", async () => {
			const businessRow = createBusinessRow({ legal_name: "Ventairy Inc." });
			const controllerRow = createControllerRow({ id: "ctrl-1", legal_first_name: "João" });
			const guard = new ImmutableBusinessGuard(
				createMockBusinessRepository({
					business: businessRow,
					controllers: [controllerRow],
				}),
				createMockKycRepository({ rowExists: true, kycStatus: VentairyKycStatus.APPROVED }),
			);
			const context = createMockContext({
				actor: { id: "user-1", kycStatus: VentairyKycStatus.APPROVED },
				body: {
					legal_name: "Ventairy Inc.",
					controllers: [{ id: "ctrl-1", legal_first_name: "Carlos" }],
				},
			});

			await expect(guard.canActivate(context)).rejects.toThrow(BusinessFieldImmutableException);
		});

		it("should allow new controllers (no id) when KYC is APPROVED", async () => {
			const businessRow = createBusinessRow({ legal_name: "Ventairy Inc." });
			const guard = new ImmutableBusinessGuard(
				createMockBusinessRepository({ business: businessRow }),
				createMockKycRepository({ rowExists: true, kycStatus: VentairyKycStatus.APPROVED }),
			);
			const context = createMockContext({
				actor: { id: "user-1", kycStatus: VentairyKycStatus.APPROVED },
				body: {
					legal_name: "Ventairy Inc.",
					controllers: [{ legal_first_name: "New Person" }],
				},
			});

			const result = await guard.canActivate(context);
			expect(result).toBe(true);
		});

		it("should refetch KYC status from DB (not use JWT) and block when DB says APPROVED", async () => {
			const businessRow = createBusinessRow({ legal_name: "Ventairy Inc." });
			const guard = new ImmutableBusinessGuard(
				createMockBusinessRepository({ business: businessRow }),
				createMockKycRepository({ rowExists: true, kycStatus: VentairyKycStatus.APPROVED }),
			);
			const context = createMockContext({
				actor: { id: "user-1", kycStatus: VentairyKycStatus.PENDING },
				body: { legal_name: "Ventairy LLC" },
			});

			await expect(guard.canActivate(context)).rejects.toThrow(BusinessFieldImmutableException);
		});

		it("should return true when no actor is present", async () => {
			const guard = new ImmutableBusinessGuard(
				createMockBusinessRepository(),
				createMockKycRepository(),
			);
			const context = createMockContext({ actor: undefined });

			const result = await guard.canActivate(context);
			expect(result).toBe(true);
		});
	});
});
