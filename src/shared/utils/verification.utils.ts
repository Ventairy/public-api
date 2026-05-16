import { VerificationStatus } from "@shared/enums";

export const VerificationUtils = {
	canModifyVerificationData(verificationStatus: VerificationStatus): boolean {
		return verificationStatus !== VerificationStatus.VERIFIED;
	},
} as const;