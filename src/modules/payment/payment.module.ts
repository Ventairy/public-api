import { Module } from "@nestjs/common";
import { PaymentController } from "./controllers/payment.controller";
import { PaymentService } from "./payment.service";
import { UserLiquidityProvidersModule } from "@modules/providers/user-liquidity-providers.module";
import { VerificationModule } from "@modules/verification/verification.module";

@Module({
	imports: [UserLiquidityProvidersModule, VerificationModule],
	controllers: [PaymentController],
	providers: [PaymentService],
})
export class PaymentModule {}
