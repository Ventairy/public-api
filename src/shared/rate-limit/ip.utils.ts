function extractClientIp(request: { headers: Record<string, string | string[] | undefined>; ip?: string }): string {
	const cloudflareIp = request.headers["cf-connecting-ip"];

	if (typeof cloudflareIp === "string" && cloudflareIp.length > 0) return cloudflareIp;

	const forwardedFor = request.headers["x-forwarded-for"];

	if (typeof forwardedFor === "string") {
		const firstIp = forwardedFor.split(",")[0]?.trim();

		if (firstIp && firstIp.length > 0) return firstIp;
	}

	if (request.ip) return request.ip;

	return "unknown";
}

export const IpUtils = { extractClientIp } as const;
