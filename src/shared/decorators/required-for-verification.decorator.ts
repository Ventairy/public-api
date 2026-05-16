import { UserType } from "@shared/enums/user-type";

export const REQUIRED_FOR_VERIFICATION_DECORATOR_KEY = "requiredForVerification";

export interface RequiredForVerificationDecoratorMetadata {
	propertyKey: string;
	userTypes: UserType[];
}

export function RequiredForVerification(userTypes: UserType[]): PropertyDecorator {
	return (target: object, propertyKey: string | symbol): void => {
		const constructor = target.constructor;

		const existing: RequiredForVerificationDecoratorMetadata[] =
			Reflect.getOwnMetadata(REQUIRED_FOR_VERIFICATION_DECORATOR_KEY, constructor) ?? [];

		Reflect.defineMetadata(
			REQUIRED_FOR_VERIFICATION_DECORATOR_KEY,
			[...existing, { propertyKey: String(propertyKey), userTypes }],
			constructor,
		);
	};
}
