import { Injectable } from "@nestjs/common";
import { KycRepository } from "./repositories/kyc.repository";
import { VentairyKycStatus } from "@shared/constants";
import { KycSubmissionLockedException } from "@shared/exceptions/kyc-submission-locked.exception";
import { UserNotFoundException } from "@shared/exceptions/user-not-found.exception";
import { KycSubmissionOutputDto, KycStatusOutputDto } from "./dto";

@Injectable()
export class KycService {
	constructor(private readonly _kycRepository: KycRepository) {}

	public async submitKyc(userId: string): Promise<KycSubmissionOutputDto> {
		const kycRow = await this._getKycDatabaseRow(userId);

		if (kycRow.ventairy_kyc_status !== VentairyKycStatus.PENDING) {
			throw new KycSubmissionLockedException({ userId, kycStatus: kycRow.ventairy_kyc_status });
		}

		const now = new Date().toISOString();
		await this._kycRepository.updateStatusByUserId({ userId, status: VentairyKycStatus.VERIFYING, submittedAt: now });

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

	private async _getKycDatabaseRow(userId: string): Promise<import("@db/schema/kyc-table").KycRow> {
		const row = await this._kycRepository.findByUserId(userId);
		if (!row) throw new UserNotFoundException(userId);

		return row;
	}
}
