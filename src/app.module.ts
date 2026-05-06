import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { CoreModule } from './core';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users';

@Module({
  imports: [
    CoreModule,
    AuthModule,
    UsersModule,
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
