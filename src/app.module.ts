import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { CoreModule } from './core';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user';
import { KycModule } from './modules/kyc';
import { BusinessModule } from './modules/business';

@Module({
  imports: [
    CoreModule,
    AuthModule,
    UserModule,
    KycModule,
    BusinessModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    EventEmitterModule.forRoot(),
  ],
})
export class AppModule {}
