import { HttpException, HttpStatus } from '@nestjs/common';

export abstract class DomainException extends HttpException {
  constructor(
    public readonly domainCode: string,
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super({ statusCode, code: domainCode, message }, statusCode);
  }
}
