import { Module, forwardRef } from "@nestjs/common";
import { KycModule } from "@modules/kyc/kyc.module";
import { APP_GUARD } from "@nestjs/core";
import { UserModule } from "@modules/user/user.module";
import { RateLimitGuard } from "@shared/rate-limit/rate-limit.guard";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { WalletAuthService } from "./wallet/wallet-auth.service";
import { WalletNonceService } from "./wallet/wallet-nonce.service";
import { SiweVerifierService } from "./verification/siwe-verifier.service";
import { SignatureNonceRepository } from "./repositories/signature-nonce.repository";
import { UserSessionRepository } from "./repositories/user-session.repository";
import { JwtService } from "./jwt/jwt.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { UserTypeGuard } from "./guards/user-type.guard";
import { KYCGuard } from "./guards/kyc.guard";

@Module({
	imports: [forwardRef(() => UserModule), KycModule],
	controllers: [AuthController],
	providers: [
		AuthService,
		WalletAuthService,
		WalletNonceService,
		SiweVerifierService,
		SignatureNonceRepository,
		UserSessionRepository,
		JwtService,
		{
			provide: APP_GUARD,
			useClass: JwtAuthGuard,
		},
		{
			provide: APP_GUARD,
			useClass: RateLimitGuard,
		},
		{
			provide: APP_GUARD,
			useClass: UserTypeGuard,
		},
		{
			provide: APP_GUARD,
			useClass: KYCGuard,
		},
	],
	exports: [
		AuthService,
		WalletAuthService,
		WalletNonceService,
		SiweVerifierService,
		SignatureNonceRepository,
		UserSessionRepository,
		JwtService,
	],
})
export class AuthModule {}
