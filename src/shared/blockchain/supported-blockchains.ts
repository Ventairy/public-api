import { base, baseSepolia, Chain } from "viem/chains";

export enum SupportedBlockchain {
	BASE = 8453,
	BASE_SEPOLIA = 84532,
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
	[SupportedBlockchain.BASE_SEPOLIA]: {
		name: "Base Sepolia",
		chainId: SupportedBlockchain.BASE_SEPOLIA,
		viemChain: baseSepolia,
		publicRpcUrls: ["https://sepolia.base.org"],
	},
};

export function getBlockchainMetadata(chainId: SupportedBlockchain): BlockchainMetadata {
	return BLOCKCHAIN_METADATA[chainId];
}
