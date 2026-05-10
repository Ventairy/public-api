import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "@modules/auth/auth.module";
import { KycModule } from "@modules/kyc/kyc.module";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { UserRepository } from "./repositories/user.repository";

@Module({
	imports: [forwardRef(() => AuthModule), KycModule],
	controllers: [UsersController],
	providers: [UsersService, UserRepository],
	exports: [UsersService, UserRepository],
})
export class UsersModule {}
