import { describe, it, expect } from "vitest";
import { BusinessInputDto } from "@modules/business/dto";
import { CustomValidationPipe } from "@shared/pipes/validation.pipe";

describe("BusinessController — saveBusiness ValidationPipe (undefined body rejection)", () => {
	const pipe = new CustomValidationPipe();

	it("transforms undefined body to empty validated object (does not crash)", async () => {
		const result = await pipe.transform(undefined, {
			type: "body",
			metatype: BusinessInputDto,
		});

		expect(result).toBeDefined();
	});

	it("transforms null body to empty validated object (does not crash)", async () => {
		const result = await pipe.transform(null, {
			type: "body",
			metatype: BusinessInputDto,
		});

		expect(result).toBeDefined();
	});

	it("validates a populated BusinessInputDto and preserves camelCase fields", async () => {
		const body = { legal_name: "Acme Corp", email: "contact@acme.com" };

		const result = await pipe.transform(body, {
			type: "body",
			metatype: BusinessInputDto,
		});

		expect(result).toBeDefined();
		expect(result).toHaveProperty("legalName", "Acme Corp");
	});

	it("accepts empty object (all fields optional)", async () => {
		const result = await pipe.transform({}, {
			type: "body",
			metatype: BusinessInputDto,
		});

		expect(result).toBeDefined();
	});
});
