import { Module } from "@nestjs/common";
import { PaymentController } from "./controllers/payment.controller";
import { PaymentService } from "./payment.service";
import { UserLiquidityProvidersModule } from "@modules/providers/user-liquidity-providers.module";

@Module({
	imports: [UserLiquidityProvidersModule],
	controllers: [PaymentController],
	providers: [PaymentService],
})
export class PaymentModule {}
