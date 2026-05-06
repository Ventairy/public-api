import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { WalletAuthService } from "./wallet/wallet-auth.service";
import { WalletNonceService } from "./wallet/wallet-nonce.service";
import { SiweVerifierService } from "./verification/siwe-verifier.service";

@Module({
	controllers: [AuthController],
	providers: [WalletAuthService, WalletNonceService, SiweVerifierService],
	exports: [WalletAuthService, WalletNonceService, SiweVerifierService],
})
export class AuthModule {}
