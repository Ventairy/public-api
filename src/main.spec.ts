import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

describe("main.ts bootstrap", () => {
	const mainSource = readFileSync(resolve(__dirname, "main.ts"), "utf-8");

	it("should enable trust proxy for correct client IP resolution behind Cloudflare", () => {
		expect(mainSource).toContain('application.set("trust proxy", true)');
	});

	it("should set trust proxy before helmet", () => {
		const trustProxyIndex = mainSource.indexOf('"trust proxy"');
		const helmetIndex = mainSource.indexOf("helmet()");
		expect(trustProxyIndex).toBeGreaterThan(-1);
		expect(helmetIndex).toBeGreaterThan(trustProxyIndex);
	});
});
