import { Module } from "@nestjs/common";
import { KycRepository } from "./repositories/kyc.repository";

@Module({
	providers: [KycRepository],
	exports: [KycRepository],
})
export class KycRepositoryModule {}
