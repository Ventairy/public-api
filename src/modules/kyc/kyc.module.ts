import { Module } from "@nestjs/common";
import { BusinessModule } from "@modules/business/business.module";
import { KycRepositoryModule } from "./kyc-repository.module";
import { KycController } from "./kyc.controller";
import { KycService } from "./kyc.service";

@Module({
	imports: [KycRepositoryModule, BusinessModule],
	controllers: [KycController],
	providers: [KycService],
	exports: [KycService],
})
export class KycModule {}
