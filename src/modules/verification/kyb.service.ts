import { Injectable } from "@nestjs/common";
import { UserType, BusinessFileType, BusinessControllerFileType } from "@shared/enums";
import { REQUIRED_FOR_VERIFICATION_DECORATOR_KEY, type RequiredForVerificationDecoratorMetadata } from "@shared/decorators/required-for-verification.decorator";
import { BusinessNotFoundException } from "@shared/exceptions/business-not-found.exception";
import { BusinessService } from "@modules/business/business.service";
import { VerificationMissingDto } from "./dto";
import { BusinessInputDto } from "@modules/business/dto/business-input.dto";
import { DtoUtils } from "@shared/utils/dto.utils";
import type { Actor } from "@shared/types/actor.type";
import type { BusinessOutputDto } from "@modules/business/dto";

@Injectable()
export class KybService {
	constructor(private readonly _businessService: BusinessService) {}

	public async getKybMissingData(actor: Actor, notFoundBehaviour: "null" | "throw"): Promise<VerificationMissingDto> {
		const business = await this._businessService.getBusiness(actor.id).catch((error) => {
			if (error instanceof BusinessNotFoundException && notFoundBehaviour === "null") return null;
			throw error;
		});

		return this._getKybMissingData(business, actor.userType);
	}

	private _getKybMissingData(business: BusinessOutputDto | null, userType: UserType): VerificationMissingDto {
		const missingFields = this._getKybMissingFieldsForBusiness(business, userType);
		const missingFiles = this._getKybMissingFilesForBusiness(business);

		return new VerificationMissingDto({ fields: missingFields, files: missingFiles });
	}

	private _getKybMissingFieldsForBusiness(business: BusinessOutputDto | null, userType: UserType): string[] {
		const kybDtoPaths = this._getKybDtoPathsForBusiness(userType);

		if (!business) {
			const nonControllerPaths = kybDtoPaths.filter((p) => !p.startsWith("controllers."));
			return [...nonControllerPaths, "controllers"].map((f) => `business.${f}`);
		}

		const missingKybFields: string[] = [];
		const controllerPaths = kybDtoPaths.filter((p) => p.startsWith("controllers."));
		const nonControllerPaths = kybDtoPaths.filter((p) => !p.startsWith("controllers."));

		for (const path of nonControllerPaths) {
			if (!DtoUtils.isPathFieldDefined(business, path)) missingKybFields.push(path);
		}

		if (!business.controllers || business.controllers.length === 0) missingKybFields.push("controllers");
		else {
			for (const controller of business.controllers) {
				for (const path of controllerPaths) {
					const controllerRelativePath = path.substring(path.indexOf(".") + 1);

					if (!DtoUtils.isPathFieldDefined(controller, controllerRelativePath)) {
						missingKybFields.push(`${path.split(".")[0]}.${controller.id}.${controllerRelativePath}`);
					}
				}
			}
		}

		return missingKybFields.map((field) => `business.${field}`);
	}

	private _getKybMissingFilesForBusiness(business: BusinessOutputDto | null): string[] {
		const requiredBusinessFiles = [BusinessFileType.PROOF_OF_ADDRESS, BusinessFileType.INCORPORATION_DOCUMENT, BusinessFileType.PROOF_OF_OWNERSHIP];

		const requiredBusinessControllerFiles = [BusinessControllerFileType.IDENTIFICATION_FRONT, BusinessControllerFileType.PROOF_OF_ADDRESS];

		if (!business) {
			return [...requiredBusinessFiles, ...requiredBusinessControllerFiles.map((fileType) => `controllers.${fileType}`)].map((f) => `business.${f}`);
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

	private _getKybDtoPathsForBusiness(userType: UserType): string[] {
		return DtoUtils.mapFieldsToPath({
			dto: BusinessInputDto,
			filter: (dtoClass, propertyKey) => {
				const propertyMetadata: RequiredForVerificationDecoratorMetadata[] = Reflect.getOwnMetadata(REQUIRED_FOR_VERIFICATION_DECORATOR_KEY, dtoClass) ?? [];

				return propertyMetadata.some((metadata) => metadata.propertyKey === propertyKey && metadata.userTypes.includes(userType));
			},
		});
	}
}
