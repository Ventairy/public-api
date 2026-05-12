import { UserType } from "@shared/enums/user-type";

export const REQUIRED_FOR_KYC_DECORATOR_KEY = "requiredForKyc";

export interface RequiredForKycDecoratorMetadata {
	propertyKey: string;
	userTypes: UserType[];
}

export function RequiredForKYC(userTypes: UserType[]): PropertyDecorator {
	return (target: object, propertyKey: string | symbol): void => {
		const constructor = target.constructor;

		const existing: RequiredForKycDecoratorMetadata[] =
			Reflect.getOwnMetadata(REQUIRED_FOR_KYC_DECORATOR_KEY, constructor) ?? [];

		Reflect.defineMetadata(
			REQUIRED_FOR_KYC_DECORATOR_KEY,
			[...existing, { propertyKey: String(propertyKey), userTypes }],
			constructor,
		);
	};
}
