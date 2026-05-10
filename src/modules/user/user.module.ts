import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "@modules/auth/auth.module";
import { KycModule } from "@modules/kyc/kyc.module";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserRepository } from "./repositories/user.repository";

@Module({
	imports: [forwardRef(() => AuthModule), KycModule],
	controllers: [UserController],
	providers: [UserService, UserRepository],
	exports: [UserService, UserRepository],
})
export class UserModule {}
