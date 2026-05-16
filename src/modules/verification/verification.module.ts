import { Module } from "@nestjs/common";
import { BusinessModule } from "@modules/business/business.module";
import { VerificationRepositoryModule } from "./verification-repository.module";
import { VerificationController } from "./verification.controller";
import { VerificationService } from "./verification.service";
import { KybService } from "./kyb.service";
import { VerificationGuard } from "./guards/verification.guard";

@Module({
	imports: [VerificationRepositoryModule, BusinessModule],
	controllers: [VerificationController],
	providers: [VerificationService, KybService, VerificationGuard],
	exports: [VerificationService, VerificationGuard],
})
export class VerificationModule {}