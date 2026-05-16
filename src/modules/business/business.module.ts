import { Module } from "@nestjs/common";
import { UserModule } from "@modules/user/user.module";
import { VerificationRepositoryModule } from "@modules/verification/verification-repository.module";
import { BusinessController } from "./business.controller";
import { BusinessService } from "./business.service";
import { BusinessRepository } from "./repositories/business.repository";

@Module({
	imports: [UserModule, VerificationRepositoryModule],
	controllers: [BusinessController],
	providers: [BusinessService, BusinessRepository],
	exports: [BusinessService, BusinessRepository],
})
export class BusinessModule {}
