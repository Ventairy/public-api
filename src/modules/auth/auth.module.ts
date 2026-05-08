import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { WalletAuthService } from "./wallet/wallet-auth.service";
import { WalletNonceService } from "./wallet/wallet-nonce.service";
import { SiweVerifierService } from "./verification/siwe-verifier.service";
import { SignatureNonceRepository } from "./repositories/signature-nonce.repository";

@Module({
	controllers: [AuthController],
	providers: [WalletAuthService, WalletNonceService, SiweVerifierService, SignatureNonceRepository],
	exports: [WalletAuthService, WalletNonceService, SiweVerifierService, SignatureNonceRepository],
})
export class AuthModule {}
