import { Container, getContainer } from "@cloudflare/containers";

import type { Env } from "./env";

const CONTAINER_NAME = "api";
const CONTAINER_PORT = 3000;
const SLEEP_AFTER = "30m";
const PING_ENDPOINT = "localhost/v1/health/live";
const START_TIMEOUT_MS = 60_000;
const PORT_READY_TIMEOUT_MS = 60_000;

export class ApiContainer extends Container {
	override defaultPort = CONTAINER_PORT;
	override sleepAfter = SLEEP_AFTER;
	override pingEndpoint = PING_ENDPOINT;
	override entrypoint = ["bun", "dist/main.js"];

	override onStart(): void {
		console.log(`[ApiContainer] Instance "${CONTAINER_NAME}" started on port ${CONTAINER_PORT}`);
	}

	override onStop(): void {
		console.log(`[ApiContainer] Instance "${CONTAINER_NAME}" stopped`);
	}

	override onError(error: unknown): void {
		console.error(`[ApiContainer] Instance "${CONTAINER_NAME}" error:`, error);
	}
}

export default {
	async fetch(request: Request, environment: Env): Promise<Response> {
		const containerInstance = getContainer(environment.API_CONTAINER as never, CONTAINER_NAME);

		try {
			await containerInstance.startAndWaitForPorts({
				startOptions: {
					envVars: {
						NODE_ENV: environment.NODE_ENV,
						PORT: environment.PORT,
						CF_ACCOUNT_ID: environment.CF_ACCOUNT_ID,
						CF_D1_DATABASE_ID: environment.CF_D1_DATABASE_ID,
						CF_D1_API_TOKEN: environment.CF_D1_API_TOKEN,
						LOG_LEVEL: environment.LOG_LEVEL,
					},
				},
				cancellationOptions: {
					instanceGetTimeoutMS: START_TIMEOUT_MS,
					portReadyTimeoutMS: PORT_READY_TIMEOUT_MS,
				},
			});

			return containerInstance.fetch(request);
		} catch (error) {
			console.error("[ApiContainer] Failed to start container:", error);

			return new Response(
				JSON.stringify({
					message: "Container startup failed",
					error: error instanceof Error ? error.message : "Unknown error",
				}),
				{
					status: 503,
					headers: { "Content-Type": "application/json" },
				},
			);
		}
	},
};
