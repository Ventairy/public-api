import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("bunfig.toml", () => {
	const bunfigPath = path.resolve(process.cwd(), "bunfig.toml");

	it("exists at project root", () => {
		expect(fs.existsSync(bunfigPath)).toBe(true);
	});

	it("sets minimumReleaseAge to 259200 (3 days in seconds)", () => {
		const content = fs.readFileSync(bunfigPath, "utf-8");
		expect(content).toContain("minimumReleaseAge = 259200");
	});

	it("has a valid TOML structure with install section", () => {
		const content = fs.readFileSync(bunfigPath, "utf-8");
		const lines = content.split("\n").map((line) => line.trim()).filter(Boolean);
		expect(lines[0]).toBe("[install]");
	});
});
