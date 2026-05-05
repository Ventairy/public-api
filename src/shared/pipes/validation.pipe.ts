import { Injectable } from "@nestjs/common";
import { ValidationPipe as NestValidationPipe } from "@nestjs/common";
import type { ValidationError } from "class-validator";
import { createRequire } from "node:module";

import { ValidationException } from "@shared/exceptions/validation.exception";
import { getValidationHint } from "@shared/errors/validation-hint.map";
import type { FieldError } from "@shared/errors/error-response.types";

const require = createRequire(import.meta.url);

const { defaultMetadataStorage } = require("class-transformer/cjs/storage") as {
	defaultMetadataStorage: {
		exposeMetadatas: {
			target: object;
			name: string;
			options?: { name?: string };
		}[];
	};
};

const SECRET_FIELD_PATTERNS = /password|secret|token|key|credential|api[_-]?key/i;
const MAX_RECEIVED_LENGTH = 100;

@Injectable()
export class CustomValidationPipe extends NestValidationPipe {
	constructor() {
		super({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
			transformOptions: {
				enableImplicitConversion: true,
			},
			exceptionFactory: (errors: ValidationError[]) => {
				const fieldErrors = flattenValidationErrors(errors);
				return new ValidationException(fieldErrors);
			},
		});
	}
}

function flattenValidationErrors(errors: ValidationError[], parentPath = ""): FieldError[] {
	const result: FieldError[] = [];

	for (const error of errors) {
		const wirePath = resolveWirePath(error, parentPath);

		if (error.constraints) {
			for (const [constraint, message] of Object.entries(error.constraints)) {
				result.push({
					path: wirePath,
					constraint,
					message,
					hint: getValidationHint(constraint, message),
					received: formatReceivedValue(error.value),
				});
			}
		}

		if (error.children && error.children.length > 0) result.push(...flattenValidationErrors(error.children, wirePath));
	}

	return result;
}

function resolveWirePath(error: ValidationError, parentPath: string): string {
	const propertyName = error.property;
	const target = error.target;

	if (target && typeof target === "object") {
		const wireName = findWireName(target.constructor, propertyName);
		if (wireName) return parentPath ? `${parentPath}.${wireName}` : wireName;
	}

	return parentPath ? `${parentPath}.${propertyName}` : propertyName;
}

function findWireName(constructor: object, propertyName: string): string | null {
	const exposeMetadatas = defaultMetadataStorage?.exposeMetadatas;
	if (!exposeMetadatas) {
		return null;
	}

	for (const meta of exposeMetadatas) {
		if (meta.target === constructor && meta.options?.name === propertyName) {
			return meta.name;
		}
	}

	return null;
}

function formatReceivedValue(value: unknown): string | null {
	if (value === undefined || value === null) return null;

	const stringValue = typeof value === "string" ? value : JSON.stringify(value);

	if (SECRET_FIELD_PATTERNS.test(stringValue) && stringValue.length < 200) return "[REDACTED]";
	if (stringValue.length > MAX_RECEIVED_LENGTH) return `${stringValue.slice(0, MAX_RECEIVED_LENGTH)}\u2026`;

	return stringValue;
}
