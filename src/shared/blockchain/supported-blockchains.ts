import { base } from "viem/chains";

export enum SupportedBlockchain {
	BASE = 8453,
}

export interface BlockchainDescriptor {
	name: string;
	chainId: SupportedBlockchain;
	chain: typeof base;
	publicRpcUrls: readonly string[];
}

export const SUPPORTED_BLOCKCHAINS: Record<SupportedBlockchain, BlockchainDescriptor> = {
	[SupportedBlockchain.BASE]: {
		name: "Base",
		chainId: SupportedBlockchain.BASE,
		chain: base,
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

export function getBlockchainByChainId(chainId: number): BlockchainDescriptor | undefined {
	return SUPPORTED_BLOCKCHAINS[chainId as SupportedBlockchain];
}
