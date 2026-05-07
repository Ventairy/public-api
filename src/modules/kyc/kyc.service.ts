import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DrizzleService } from "@core/database/drizzle.service";
import { kycTable, type KycRow } from "@db/schema/kyc-table";
import { VentairyKycStatus } from "@shared/constants";
import { KycSubmissionLockedException } from "@shared/exceptions/kyc-submission-locked.exception";
import { UserNotFoundException } from "@shared/exceptions/user-not-found.exception";
import { KycSubmissionOutputDto, KycStatusOutputDto } from "./dto";

@Injectable()
export class KycService {
	constructor(private readonly drizzleService: DrizzleService) {}

	public async submitKyc(userId: string): Promise<KycSubmissionOutputDto> {
		const kycRow = await this._getKycDatabaseRow(userId);

		if (kycRow.ventairy_kyc_status !== VentairyKycStatus.PENDING) {
			throw new KycSubmissionLockedException({ userId, kycStatus: kycRow.ventairy_kyc_status });
		}

		const now = new Date().toISOString();
		await this.drizzleService.db
			.update(kycTable)
			.set({ kyc_submitted_at: now, ventairy_kyc_status: VentairyKycStatus.VERIFYING })
			.where(eq(kycTable.user_id, userId));

		return this._getKycDataAsDto(userId);
	}

	public async getKycStatus(userId: string): Promise<KycStatusOutputDto> {
		const kycRow = await this._getKycDatabaseRow(userId);

		return KycStatusOutputDto.fromDatabaseRow(kycRow);
	}

	private async _getKycDataAsDto(userId: string): Promise<KycSubmissionOutputDto> {
		const kycRow = await this._getKycDatabaseRow(userId);

		return KycSubmissionOutputDto.fromDatabaseRow(kycRow);
	}

	private async _getKycDatabaseRow(userId: string): Promise<KycRow> {
		const rows = await this.drizzleService.db.select().from(kycTable).where(eq(kycTable.user_id, userId));
		const row = rows[0];
		if (!row) throw new UserNotFoundException(userId);

		return row;
	}
}
