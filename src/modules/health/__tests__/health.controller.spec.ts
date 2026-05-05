import { describe, it, expect, vi, beforeEach } from "vitest";
import { HealthCheckService } from "@nestjs/terminus";
import { HealthController } from "../health.controller";

describe("HealthController", () => {
	let controller: HealthController;
	let mockHealthCheckService: Partial<HealthCheckService>;

	beforeEach(() => {
		mockHealthCheckService = {
			check: vi.fn().mockImplementation(() => Promise.resolve({ status: "ok" })),
		};
		controller = new HealthController(mockHealthCheckService as HealthCheckService);
	});

	it("should call health.check in liveness", async () => {
		const result = await controller.liveness();
		expect(result).toEqual({ status: "ok" });
		expect(mockHealthCheckService.check).toHaveBeenCalledWith([]);
	});

	it("should call health.check in readiness", async () => {
		const result = await controller.readiness();
		expect(result).toEqual({ status: "ok" });
		expect(mockHealthCheckService.check).toHaveBeenCalledWith([]);
	});
});
