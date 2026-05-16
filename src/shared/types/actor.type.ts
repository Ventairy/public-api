import { SupportedBlockchain } from "@shared/blockchain";
import type { UserType } from "@shared/enums/user-type";
import type { VerificationStatus } from "@shared/enums";

export interface Actor {
	id: string;
	sessionId: string;
	userType: UserType;
	walletAddress: string;
	chainId: SupportedBlockchain;
	verificationStatus: VerificationStatus;
}
