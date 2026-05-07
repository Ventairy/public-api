import { Module } from "@nestjs/common";
import { UsersModule } from "@modules/users/users.module";
import { BusinessController } from "./business.controller";
import { BusinessService } from "./business.service";

@Module({
	imports: [UsersModule],
	controllers: [BusinessController],
	providers: [BusinessService],
	exports: [BusinessService],
})
export class BusinessModule {}
