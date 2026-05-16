import { Injectable } from "@nestjs/common";
import { VerificationRepository } from "./repositories/verification.repository";
import { VerificationStatus, UserType } from "@shared/enums";
import { VerificationSubmissionLockedException } from "@shared/exceptions/verification-submission-locked.exception";
import { VerificationSubmissionRequirementsNotMetException } from "@shared/exceptions/verification-submission-requirements-not-met.exception";
import { UserVerificationNotFoundException } from "@shared/exceptions/user-verification-not-found.exception";
import { KybService } from "./kyb.service";
import { VerificationSubmissionOutputDto, VerificationStatusOutputDto, VerificationMissingDto } from "./dto";
import type { Actor } from "@shared/types/actor.type";

@Injectable()
export class VerificationService {
	constructor(
		private readonly _verificationRepository: VerificationRepository,
		private readonly _kybService: KybService,
	) {}

	public async submitVerification(actor: Actor): Promise<VerificationSubmissionOutputDto> {
		const [currentVerificationStatus, missingVerificationData] = await Promise.all([
			this._verificationRepository.getVerificationStatus(actor.id),
			this._getMissingVerificationData({ actor, notFoundBehaviour: "throw" }),
		]);

		if (currentVerificationStatus !== VerificationStatus.PENDING) {
			throw new VerificationSubmissionLockedException({ userId: actor.id, verificationStatus: currentVerificationStatus });
		}

		if (!this._canSubmitVerification(currentVerificationStatus, missingVerificationData)) {
			throw new VerificationSubmissionRequirementsNotMetException({
				userId: actor.id,
				missing: { fields: missingVerificationData.fields, files: missingVerificationData.files },
			});
		}

		const now = new Date().toISOString();
		const updatedRow = await this._verificationRepository.updateStatusByUserId({
			userId: actor.id,
			status: VerificationStatus.VERIFYING,
			submittedAt: now,
		});

		return VerificationSubmissionOutputDto.fromDatabaseRow(updatedRow);
	}

	public async getVerificationStatus(actor: Actor): Promise<VerificationStatusOutputDto> {
		const [verificationRow, missingVerificationData] = await Promise.all([
			this._verificationRepository.findByUserId(actor.id),
			this._getMissingVerificationData({ actor, notFoundBehaviour: "null" }),
		]);

		if (!verificationRow) throw new UserVerificationNotFoundException(actor.id);

		const canSubmit = this._canSubmitVerification(verificationRow.verification_status, missingVerificationData);
		return VerificationStatusOutputDto.fromDatabaseRow(verificationRow, canSubmit, missingVerificationData);
	}

	private async _getMissingVerificationData(params: { actor: Actor; notFoundBehaviour: "null" | "throw" }): Promise<VerificationMissingDto> {
		switch (params.actor.userType) {
			case UserType.BUSINESS: {
				return this._kybService.getKybMissingData(params.actor, params.notFoundBehaviour);
			}
		}
	}

	private _canSubmitVerification(verificationStatus: VerificationStatus, missing: VerificationMissingDto): boolean {
		return verificationStatus === VerificationStatus.PENDING && missing.fields.length === 0 && missing.files.length === 0;
	}
}