import { SupportedBlockchain } from "@shared/blockchain";
import type { UserType, VentairyKycStatus } from "@shared/enums";

export interface IAccessTokenPayload {
	sub: string;
	sid: string;
	user_type: UserType;
	wallet_address: string;
	chain_id: SupportedBlockchain;
	kyc_status: VentairyKycStatus;
}
