import { applyDecorators, UseGuards } from "@nestjs/common";
import { VerificationGuard } from "./verification.guard";

export const RequireVerification = (): ReturnType<typeof applyDecorators> => applyDecorators(UseGuards(VerificationGuard));
