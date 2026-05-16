import { SupportedBlockchain } from "@shared/blockchain";
import type { UserType, VerificationStatus } from "@shared/enums";

export interface IAccessTokenPayload {
	sub: string;
	sid: string;
	user_type: UserType;
	wallet_address: string;
	chain_id: SupportedBlockchain;
	verification_status: VerificationStatus;
}
