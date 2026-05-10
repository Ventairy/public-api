import { Module, forwardRef } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { UserModule } from "@modules/user/user.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { WalletAuthService } from "./wallet/wallet-auth.service";
import { WalletNonceService } from "./wallet/wallet-nonce.service";
import { SiweVerifierService } from "./verification/siwe-verifier.service";
import { SignatureNonceRepository } from "./repositories/signature-nonce.repository";
import { UserSessionRepository } from "./repositories/user-session.repository";
import { JwtService } from "./jwt/jwt.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@Module({
	imports: [forwardRef(() => UserModule)],
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
