import { SiweMessage } from "siwe";
import { getBlockchainByChainId } from "@shared/blockchain";
import { SiweMessageInvalidException } from "@shared/exceptions/siwe-message-invalid.exception";
import type { SiweConfig } from "@core/config";

export function parseSiweMessage(rawMessage: string): SiweMessage {
	try {
		return new SiweMessage(rawMessage);
	} catch {
		throw new SiweMessageInvalidException("message could not be parsed as a valid ERC-4361 SIWE message");
	}
}

export function validateSiweMessageDomain(message: SiweMessage, expectedDomain: string): void {
	if (message.domain !== expectedDomain) {
		throw new SiweMessageInvalidException(`domain mismatch: expected "${expectedDomain}", got "${message.domain}"`);
	}
}

export function validateSiweMessageUri(message: SiweMessage, expectedUri: string): void {
	if (message.uri !== expectedUri) {
		throw new SiweMessageInvalidException(`uri mismatch: expected "${expectedUri}", got "${message.uri}"`);
	}
}

export function validateSiweMessageChainId(message: SiweMessage): void {
	const blockchainDescriptor = getBlockchainByChainId(message.chainId);
	if (!blockchainDescriptor) {
		throw new SiweMessageInvalidException(`unsupported chain ID: ${message.chainId}`);
	}
}

export function validateSiweMessageExpiration(message: SiweMessage): void {
	if (message.expirationTime) {
		const expirationDate = new Date(message.expirationTime);

		if (expirationDate.getTime() < Date.now()) {
			throw new SiweMessageInvalidException("message has expired");
		}
	}
}

export function validateSiweMessageNonce(message: SiweMessage): void {
	if (!message.nonce || message.nonce.length < 8) {
		throw new SiweMessageInvalidException("nonce is missing or too short");
	}
}

export function parseAndValidateSiweMessage(
	rawMessage: string,
	context: {
		siweConfig: SiweConfig;
	},
): SiweMessage {
	const message = parseSiweMessage(rawMessage);
	validateSiweMessageDomain(message, context.siweConfig.domain);
	validateSiweMessageUri(message, context.siweConfig.uri);
	validateSiweMessageChainId(message);
	validateSiweMessageExpiration(message);
	validateSiweMessageNonce(message);

	return message;
}
