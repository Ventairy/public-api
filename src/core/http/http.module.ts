import { Module } from '@nestjs/common';
import { HttpModule as NestHttpModule } from '@nestjs/axios';

@Module({
  imports: [
    NestHttpModule.register({
      timeout: 10_000,
      maxRedirects: 0,
    }),
  ],
  exports: [NestHttpModule],
})
export class HttpModule {}
