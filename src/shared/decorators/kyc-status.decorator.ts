import { SetMetadata } from "@nestjs/common";
import type { VentairyKycStatus } from "@shared/enums";

export const ALLOWED_KYC_STATUSES_DECORATOR_KEY = "allowedKycStatuses";

export const KYCStatus = (...statuses: VentairyKycStatus[]): ReturnType<typeof SetMetadata> =>
	SetMetadata(ALLOWED_KYC_STATUSES_DECORATOR_KEY, statuses);
