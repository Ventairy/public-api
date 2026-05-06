const VALIDATION_HINT_MAP: Record<string, string> = {
	isEthereumAddress:
		"Provide a 0x-prefixed 40-character hexadecimal string (e.g. 0x742d35Cc6634C0532925a3b844Bc9e7595f0BEb1).",
	isString: "Provide a valid string value.",
	isNumber: "Provide a valid number.",
	isInt: "Provide a valid integer (no decimals).",
	isPositive: "Provide a positive number greater than zero.",
	isNegative: "Provide a negative number less than zero.",
	isUUID: "Provide a valid UUID (e.g. 550e8400-e29b-41d4-a716-446655440000).",
	isEmail: "Provide a valid email address (e.g. user@example.com).",
	isUrl: "Provide a valid URL (e.g. https://example.com).",
	isEnum: "Provide one of the allowed enum values.",
	isNotEmpty: "This field must not be empty.",
	isOptional: "If provided, this field must meet the validation constraints.",
	minLength: "Increase the length to meet the minimum character requirement.",
	maxLength: "Reduce the length to meet the maximum character requirement.",
	min: "Provide a value greater than or equal to the minimum allowed.",
	max: "Provide a value less than or equal to the maximum allowed.",
	matches: "Ensure the value matches the required pattern.",
	isIn: "Provide one of the allowed values.",
	isObject: "Provide a valid JSON object.",
	isArray: "Provide a valid array.",
	arrayMinSize: "Provide an array with at least the minimum number of elements.",
	arrayMaxSize: "Provide an array with at most the maximum number of elements.",
	isBoolean: "Provide a valid boolean value (true or false).",
	isDate: "Provide a valid date string (e.g. 2026-05-04).",
	isDateString: "Provide a date string in ISO 8601 format (e.g. 2026-05-04T22:18:44.869Z).",
	isDefined: "This field is required and must be provided.",
	whitelistValidation: "Remove this field — it is not accepted by the API.",
	isHexadecimal: "Provide a valid hexadecimal string (e.g. 0x...).",
	isDecimal: "Provide a valid decimal number.",
	isBase64: "Provide a valid Base64-encoded string.",
};

export function getValidationHint(constraint: string, defaultMessage: string): string {
	const hint = VALIDATION_HINT_MAP[constraint];
	return hint ?? defaultMessage;
}
