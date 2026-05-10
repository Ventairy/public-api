import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
	test: {
		globals: true,
		root: "./test",
		environment: "node",
		include: ["**/*.e2e-spec.ts"],
	},
	resolve: {
		alias: {
			"@core": path.resolve(__dirname, "../src/core"),
			"@shared": path.resolve(__dirname, "../src/shared"),
			"@modules": path.resolve(__dirname, "../src/modules"),
			"@db": path.resolve(__dirname, "../src/db"),
		},
	},
});
