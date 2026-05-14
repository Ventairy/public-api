import { SupportedBlockchain } from "@shared/blockchain";
import type { UserType } from "@shared/enums/user-type";

export interface Actor {
	id: string;
	sessionId: string;
	userType: UserType;
	walletAddress: string;
	chainId: SupportedBlockchain;
}
