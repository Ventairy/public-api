import { base, Chain } from "viem/chains";

export enum SupportedBlockchain {
	BASE = 8453,
}

export interface BlockchainMetadata {
	name: string;
	chainId: SupportedBlockchain;
	viemChain: Chain;
	publicRpcUrls: readonly string[];
}

export const BLOCKCHAIN_METADATA: Record<SupportedBlockchain, BlockchainMetadata> = {
	[SupportedBlockchain.BASE]: {
		name: "Base",
		chainId: SupportedBlockchain.BASE,
		viemChain: base,
		publicRpcUrls: [
			"https://mainnet.base.org",
			"https://base.llamarpc.com",
			"https://base.drpc.org",
			"https://base.meowrpc.com",
			"https://base-mainnet.public.blastapi.io",
			"https://base-rpc.publicnode.com",
		],
	},
};

export function getBlockchainMetadata(chainId: SupportedBlockchain): BlockchainMetadata {
	return BLOCKCHAIN_METADATA[chainId];
}
