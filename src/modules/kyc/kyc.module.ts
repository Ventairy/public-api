import { Module, forwardRef } from "@nestjs/common";
import { BusinessModule } from "@modules/business/business.module";
import { KycController } from "./kyc.controller";
import { KycService } from "./kyc.service";
import { KycRepository } from "./repositories/kyc.repository";

@Module({
	imports: [forwardRef(() => BusinessModule)],
	controllers: [KycController],
	providers: [KycService, KycRepository],
	exports: [KycService, KycRepository],
})
export class KycModule {}
