import { Container, getContainer } from "@cloudflare/containers";

import type { Env } from "./env";

const CONTAINER_NAME = "api";
const CONTAINER_PORT = 3000;
const SLEEP_AFTER = "30m";
const PING_ENDPOINT = "localhost:3000/v1/health/live";

export class ApiContainer extends Container {
  override defaultPort = CONTAINER_PORT;
  override sleepAfter = SLEEP_AFTER;
  override pingEndpoint = PING_ENDPOINT;

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
    return containerInstance.fetch(request);
  },
};
