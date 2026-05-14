import { describe, it, expect } from "vitest";
import { SupportedBlockchain, BLOCKCHAIN_METADATA, getBlockchainMetadata } from "../supported-blockchains";

describe("SupportedBlockchain", () => {
	it("should have BASE with chain ID 8453", () => {
		expect(SupportedBlockchain.BASE).toBe(8453);
	});

	it("should have BASE_SEPOLIA with chain ID 84532", () => {
		expect(SupportedBlockchain.BASE_SEPOLIA).toBe(84532);
	});
});

describe("BLOCKCHAIN_METADATA", () => {
	it("should contain metadata for BASE", () => {
		const metadata = BLOCKCHAIN_METADATA[SupportedBlockchain.BASE];
		expect(metadata).toBeDefined();
		expect(metadata.name).toBe("Base");
		expect(metadata.chainId).toBe(SupportedBlockchain.BASE);
		expect(metadata.publicRpcUrls.length).toBeGreaterThan(0);
	});

	it("should contain metadata for BASE_SEPOLIA", () => {
		const metadata = BLOCKCHAIN_METADATA[SupportedBlockchain.BASE_SEPOLIA];
		expect(metadata).toBeDefined();
		expect(metadata.name).toBe("Base Sepolia");
		expect(metadata.chainId).toBe(SupportedBlockchain.BASE_SEPOLIA);
		expect(metadata.publicRpcUrls.length).toBeGreaterThan(0);
	});

	it("should have a viemChain for each entry", () => {
		const chainIds = [SupportedBlockchain.BASE, SupportedBlockchain.BASE_SEPOLIA];
		for (const chainId of chainIds) {
			expect(BLOCKCHAIN_METADATA[chainId].viemChain).toBeDefined();
		}
	});
});

describe("getBlockchainMetadata", () => {
	it("should return metadata for BASE", () => {
		const metadata = getBlockchainMetadata(SupportedBlockchain.BASE);
		expect(metadata.name).toBe("Base");
	});

	it("should return metadata for BASE_SEPOLIA", () => {
		const metadata = getBlockchainMetadata(SupportedBlockchain.BASE_SEPOLIA);
		expect(metadata.name).toBe("Base Sepolia");
	});
});
