import { SetMetadata } from "@nestjs/common";

export const KYC_REQUIRED_DECORATOR_KEY = "kycRequired";

export const KYCRequired = (): ReturnType<typeof SetMetadata> => SetMetadata(KYC_REQUIRED_DECORATOR_KEY, true);
