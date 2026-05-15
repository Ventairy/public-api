import { Module, forwardRef } from "@nestjs/common";
import { UserModule } from "@modules/user/user.module";
import { KycModule } from "@modules/kyc/kyc.module";
import { BusinessController } from "./business.controller";
import { BusinessService } from "./business.service";
import { BusinessRepository } from "./repositories/business.repository";
import { ImmutableBusinessGuard } from "./guards/immutable-business.guard";

@Module({
	imports: [forwardRef(() => UserModule), forwardRef(() => KycModule)],
	controllers: [BusinessController],
	providers: [BusinessService, BusinessRepository, ImmutableBusinessGuard],
	exports: [BusinessService, BusinessRepository],
})
export class BusinessModule {}
