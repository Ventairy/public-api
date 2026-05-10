import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockStartAndWaitForPorts = vi.fn().mockResolvedValue(undefined);
const mockFetch = vi.fn().mockResolvedValue(new Response('OK', { status: 200 }));
const mockGetContainer = vi.fn().mockReturnValue({
	startAndWaitForPorts: mockStartAndWaitForPorts,
	fetch: mockFetch,
});

vi.mock('@cloudflare/containers', () => ({
	Container: class MockContainer {},
	getContainer: (...args: unknown[]) => mockGetContainer(...args),
}));

import handler from './index';

describe('Worker fetch handler', () => {
	const mockEnvironment = {
		API_CONTAINER: {} as never,
		NODE_ENV: 'test',
		PORT: '3000',
		CF_ACCOUNT_ID: 'test-account',
		CF_D1_DATABASE_ID: 'test-db',
		CF_D1_API_TOKEN: 'test-token',
		LOG_LEVEL: 'debug',
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should call startAndWaitForPorts before fetch', async () => {
		const request = new Request('http://localhost/v1/health/live');

		await handler.fetch(request, mockEnvironment);

		expect(mockStartAndWaitForPorts).toHaveBeenCalledBefore(mockFetch);
	});

	it('should forward the request to the container fetch', async () => {
		const request = new Request('http://localhost/v1/health/live');

		await handler.fetch(request, mockEnvironment);

		expect(mockFetch).toHaveBeenCalledWith(request);
	});

	it('should get the container with the correct name', async () => {
		const request = new Request('http://localhost/v1/health/live');

		await handler.fetch(request, mockEnvironment);

		expect(mockGetContainer).toHaveBeenCalledWith(mockEnvironment.API_CONTAINER, 'api');
	});
});
