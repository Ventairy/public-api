import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class ProviderUnavailableException extends DomainException {
  constructor(providerName: string, reason: string) {
    super(
      'PROVIDER_UNAVAILABLE',
      `Provider ${providerName} is unavailable: ${reason}`,
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}
