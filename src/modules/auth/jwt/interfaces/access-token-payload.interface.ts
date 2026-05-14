import { SupportedBlockchain } from "@shared/blockchain";

export interface IAccessTokenPayload {
	sub: string;
	sid: string;
	user_type: string;
	wallet_address: string;
	chain_id: SupportedBlockchain;
}
