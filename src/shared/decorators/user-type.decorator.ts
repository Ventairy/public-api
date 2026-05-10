import { SetMetadata } from "@nestjs/common";
import { UserType } from "@shared/enums/user-type";

export const ALLOWED_USER_TYPES_DECORATOR_KEY = "allowedUserTypes";

export const BusinessUserOnly = (): ReturnType<typeof SetMetadata> =>
	SetMetadata(ALLOWED_USER_TYPES_DECORATOR_KEY, [UserType.BUSINESS]);
