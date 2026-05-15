import { VentairyKycStatus } from "@shared/enums";

export const KycUtils = {
	canKycStatusModifyKycData(kycStatus: VentairyKycStatus): boolean {
		return kycStatus !== VentairyKycStatus.APPROVED;
	},
} as const;
