import { Injectable } from "@nestjs/common";
import { KycRepository } from "./repositories/kyc.repository";
import { VentairyKycStatus, UserType, BusinessFileType, BusinessControllerFileType } from "@shared/constants";
import {
	REQUIRED_FOR_KYC_DECORATOR_KEY,
	type RequiredForKycDecoratorMetadata,
} from "@shared/decorators/required-for-kyc.decorator";
import { KycSubmissionLockedException } from "@shared/exceptions/kyc-submission-locked.exception";
import { KycSubmissionRequirementsNotMetException } from "@shared/exceptions/kyc-submission-requirements-not-met.exception";
import { UserNotFoundException } from "@shared/exceptions/user-not-found.exception";
import { BusinessNotFoundException } from "@shared/exceptions/business-not-found.exception";
import { BusinessService } from "@modules/business/business.service";
import { KycSubmissionOutputDto, KycStatusOutputDto, KycMissingDto } from "./dto";
import { BusinessInputDto } from "@modules/business/dto/business-input.dto";
import { DtoUtils } from "@shared/utils/dto.utils";
import type { Actor } from "@shared/types/actor.type";
import type { BusinessOutputDto } from "@modules/business/dto";

@Injectable()
export class KycService {
	constructor(
		private readonly _kycRepository: KycRepository,
		private readonly _businessService: BusinessService,
	) {}

	public async submitKyc(actor: Actor): Promise<KycSubmissionOutputDto> {
		const [currentKycStatus, missingKycData] = await Promise.all([
			this._getKycDatabaseRow(actor.id).then((row) => row.ventairy_kyc_status),
			this._getMissingKYCData({ actor, notFoundBehaviour: "throw" }),
		]);

		if (currentKycStatus !== VentairyKycStatus.PENDING) {
			throw new KycSubmissionLockedException({ userId: actor.id, kycStatus: currentKycStatus });
		}

		if (!this._canSubmitKYC(currentKycStatus, missingKycData)) {
			throw new KycSubmissionRequirementsNotMetException({
				userId: actor.id,
				missing: { fields: missingKycData.fields, files: missingKycData.files },
			});
		}

		const now = new Date().toISOString();
		const updatedRow = await this._kycRepository.updateStatusByUserId({
			userId: actor.id,
			status: VentairyKycStatus.VERIFYING,
			submittedAt: now,
		});

		return KycSubmissionOutputDto.fromDatabaseRow(updatedRow);
	}

	public async getKycStatus(actor: Actor): Promise<KycStatusOutputDto> {
		const [kycRow, missingKYCData] = await Promise.all([
			this._getKycDatabaseRow(actor.id),
			this._getMissingKYCData({ actor, notFoundBehaviour: "null" }),
		]);

		const canSubmitKyc = this._canSubmitKYC(kycRow.ventairy_kyc_status, missingKYCData);
		return KycStatusOutputDto.fromDatabaseRow(kycRow, canSubmitKyc, missingKYCData);
	}

	private async _getMissingKYCData(params: {
		actor: Actor;
		notFoundBehaviour: "null" | "throw";
	}): Promise<KycMissingDto> {
		switch (params.actor.userType) {
			case UserType.BUSINESS: {
				const business = await this._businessService.getBusiness(params.actor.id).catch((error) => {
					if (error instanceof BusinessNotFoundException && params.notFoundBehaviour === "null") return null;
					throw error;
				});

				return this._getMissingKYCDataForBusiness(business, params.actor.userType);
			}
		}
	}

	private _getMissingKYCDataForBusiness(business: BusinessOutputDto | null, userType: UserType): KycMissingDto {
		const missingFields = this._getKYCMissingFieldsForBusiness(business, userType);
		const missingFiles = this._getKYCMissingFilesForBusiness(business);

		return new KycMissingDto({ fields: missingFields, files: missingFiles });
	}

	private _getKYCMissingFieldsForBusiness(business: BusinessOutputDto | null, userType: UserType): string[] {
		const kycDtoPaths = this._getKYCDtoPathsForBusiness(userType);

		if (!business) {
			const nonControllerPaths = kycDtoPaths.filter((p) => !p.startsWith("controllers."));
			return [...nonControllerPaths, "controllers"].map((f) => `business.${f}`);
		}

		const missingKycFields: string[] = [];
		const controllerPaths = kycDtoPaths.filter((p) => p.startsWith("controllers."));
		const nonControllerPaths = kycDtoPaths.filter((p) => !p.startsWith("controllers."));

		for (const path of nonControllerPaths) {
			if (!DtoUtils.isPathFieldDefined(business, path)) missingKycFields.push(path);
		}

		if (!business.controllers || business.controllers.length === 0) missingKycFields.push("controllers");
		else {
			for (const controller of business.controllers) {
				for (const path of controllerPaths) {
					const controllerRelativePath = path.substring(path.indexOf(".") + 1);

					if (!DtoUtils.isPathFieldDefined(controller, controllerRelativePath)) {
						missingKycFields.push(`${path.split(".")[0]}.${controller.id}.${controllerRelativePath}`);
					}
				}
			}
		}

		return missingKycFields.map((field) => `business.${field}`);
	}

	private _getKYCMissingFilesForBusiness(business: BusinessOutputDto | null): string[] {
		const requiredBusinessFiles = [
			BusinessFileType.PROOF_OF_ADDRESS,
			BusinessFileType.INCORPORATION_DOCUMENT,
			BusinessFileType.PROOF_OF_OWNERSHIP,
		];

		const requiredBusinessControllerFiles = [
			BusinessControllerFileType.IDENTIFICATION_FRONT,
			BusinessControllerFileType.PROOF_OF_ADDRESS,
		];

		if (!business) {
			return [
				...requiredBusinessFiles,
				...requiredBusinessControllerFiles.map((fileType) => `controllers.${fileType}`),
			].map((f) => `business.${f}`);
		}

		const missingFileTypes: string[] = [];
		const uploadedTypes = new Set(business.fileTypesUploaded);

		for (const fileType of requiredBusinessFiles) {
			if (!uploadedTypes.has(fileType)) missingFileTypes.push(fileType);
		}

		for (const controller of business.controllers ?? []) {
			for (const controllerFileType of requiredBusinessControllerFiles) {
				if (!controller.fileTypesUploaded.includes(controllerFileType)) {
					missingFileTypes.push(`controllers.${controller.id}.${controllerFileType}`);
				}
			}
		}

		return missingFileTypes.map((field) => `business.${field}`);
	}

	private _getKYCDtoPathsForBusiness(userType: UserType): string[] {
		return DtoUtils.mapFieldsToPath({
			dto: BusinessInputDto,
			filter: (dtoClass, propertyKey) => {
				const propertyMetadata: RequiredForKycDecoratorMetadata[] =
					Reflect.getOwnMetadata(REQUIRED_FOR_KYC_DECORATOR_KEY, dtoClass) ?? [];

				return propertyMetadata.some(
					(metadata) => metadata.propertyKey === propertyKey && metadata.userTypes.includes(userType),
				);
			},
		});
	}

	private _canSubmitKYC(kycStatus: VentairyKycStatus, missing: KycMissingDto): boolean {
		return kycStatus === VentairyKycStatus.PENDING && missing.fields.length === 0 && missing.files.length === 0;
	}

	private async _getKycDatabaseRow(userId: string): Promise<import("@db/schema/kyc-table").KycRow> {
		const row = await this._kycRepository.findByUserId(userId);
		if (!row) throw new UserNotFoundException(userId);

		return row;
	}
}
