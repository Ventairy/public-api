import { Module } from "@nestjs/common";
import { PaymentController } from "./controllers/payment.controller";
import { PaymentService } from "./payment.service";
import { UserLiquidityProvidersModule } from "@modules/providers/user-liquidity-providers.module";
import { VerificationRepositoryModule } from "@modules/verification/verification-repository.module";

@Module({
	imports: [UserLiquidityProvidersModule, VerificationRepositoryModule],
	controllers: [PaymentController],
	providers: [PaymentService],
})
export class PaymentModule {}
