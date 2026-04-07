/**
 * api.ts — helpers for mocking the global fetch stub in integration tests.
 *
 * `global.fetch` is already set to a jest.fn() in jest.setup.ts.
 * These helpers configure individual per-test call responses.
 */

/** Mock the next fetch call to resolve with a successful JSON body. */
export function mockFetchSuccess(body: unknown): void {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as Response);
}

/** Mock the next fetch call to resolve with a non-ok HTTP status. */
export function mockFetchError(status = 500, body = ''): void {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
    status,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(body),
  } as Response);
}

/** Mock the next fetch call to reject with a network-level error. */
export function mockFetchNetworkError(): void {
  (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
}
