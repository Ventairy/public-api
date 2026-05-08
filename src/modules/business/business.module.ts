import { Module } from "@nestjs/common";
import { UsersModule } from "@modules/users/users.module";
import { BusinessController } from "./business.controller";
import { BusinessService } from "./business.service";
import { BusinessRepository } from "./repositories/business.repository";

@Module({
	imports: [UsersModule],
	controllers: [BusinessController],
	providers: [BusinessService, BusinessRepository],
	exports: [BusinessService, BusinessRepository],
})
export class BusinessModule {}
