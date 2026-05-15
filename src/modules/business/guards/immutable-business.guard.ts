import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { VentairyKycStatus } from "@shared/enums";
import { BusinessInputDto } from "@modules/business/dto/business-input.dto";
import { BusinessRepository } from "@modules/business/repositories/business.repository";
import { KycRepository } from "@modules/kyc/repositories/kyc.repository";
import { BusinessFieldImmutableException } from "@shared/exceptions/business-field-immutable.exception";
import { ImmutableFieldUtils } from "@shared/utils/immutable-field.utils";
import type { Actor } from "@shared/types/actor.type";

@Injectable()
export class ImmutableBusinessGuard implements CanActivate {
	constructor(
		private readonly _businessRepository: BusinessRepository,
		private readonly _kycRepository: KycRepository,
	) {}

	public async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const actor: Actor | undefined = request.user;

		if (!actor) return true;

		const currentKycStatus = await this._kycRepository.getKycStatus(actor.id);
		if (currentKycStatus !== VentairyKycStatus.APPROVED) return true;

		const updatedBusiness = plainToInstance(BusinessInputDto, request.body as object);
		const existingBusiness = await this._businessRepository.findBusinessByUserId(actor.id);

		if (!existingBusiness) return true;

		const existingControllers = await this._businessRepository.findControllersByBusinessId(existingBusiness.id);
		const existingBusinessAsInputDto = BusinessInputDto.fromDatabaseRow(existingBusiness, existingControllers);

		if (
			ImmutableFieldUtils.hasImmutableViolations({
				requestDto: updatedBusiness,
				databaseDto: existingBusinessAsInputDto,
				dtoClass: BusinessInputDto,
			})
		) {
			throw new BusinessFieldImmutableException();
		}

		return true;
	}
}
