export interface FieldError {
	path: string;
	constraint: string;
	message: string;
	hint: string;
	received: string | null;
}

export interface ErrorDetails {
	errors?: FieldError[];
	context?: Record<string, unknown>;
	hint?: string;
	incidentId?: string;
}

export interface ErrorResponse {
	statusCode: number;
	code: string;
	message: string;
	requestId: string;
	timestamp: string;
	path: string;
	method: string;
	details?: ErrorDetails;
}
