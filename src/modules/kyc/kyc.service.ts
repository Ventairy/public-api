import { Injectable } from "@nestjs/common";
import { KycRepository } from "./repositories/kyc.repository";
import { VentairyKycStatus, UserType, BusinessFileType, BusinessControllerFileType } from "@shared/constants";
import {
	REQUIRED_FOR_KYC_DECORATOR_KEY,
	type RequiredForKycDecoratorMetadata,
} from "@shared/decorators/required-for-kyc.decorator";
import { KycSubmissionLockedException } from "@shared/exceptions/kyc-submission-locked.exception";
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

	public async submitKyc(userId: string): Promise<KycSubmissionOutputDto> {
		const kycRow = await this._getKycDatabaseRow(userId);

		if (kycRow.ventairy_kyc_status !== VentairyKycStatus.PENDING) {
			throw new KycSubmissionLockedException({ userId, kycStatus: kycRow.ventairy_kyc_status });
		}

		const now = new Date().toISOString();
		await this._kycRepository.updateStatusByUserId({ userId, status: VentairyKycStatus.VERIFYING, submittedAt: now });

		return this._getKycDataAsDto(userId);
	}

	public async getKycStatus(actor: Actor): Promise<KycStatusOutputDto> {
		const kycRow = await this._getKycDatabaseRow(actor.id);
		const missing = await this._getMissingKYCDataForBusiness(actor.id, actor.userType);

		const canSubmitKyc =
			missing.fields.length === 0 &&
			missing.files.length === 0 &&
			kycRow.ventairy_kyc_status === VentairyKycStatus.PENDING;

		return KycStatusOutputDto.fromDatabaseRow(kycRow, canSubmitKyc, missing);
	}

	private async _getMissingKYCDataForBusiness(userId: string, userType: UserType): Promise<KycMissingDto> {
		let business: BusinessOutputDto | null = null;

		try {
			business = await this._businessService.getBusiness(userId);
		} catch (error) {
			if (!(error instanceof BusinessNotFoundException)) throw error;
		}

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
