export const VENTAIRY_KYC_STATUS = {
	APPROVED: "APPROVED",
	PENDING: "PENDING",
	VERIFYING: "VERIFYING",
	REJECTED: "REJECTED",
} as const;

export type VentairyKycStatus = (typeof VENTAIRY_KYC_STATUS)[keyof typeof VENTAIRY_KYC_STATUS];
