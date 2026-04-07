/**
 * navigation.ts — helpers for asserting router calls in integration tests.
 *
 * The expo-router mock (jest.setup.ts) makes `useRouter()` return a stable
 * object whose methods are jest.fn(). Calling `(useRouter as jest.Mock)()`
 * here returns that same object so tests can assert on it.
 */
import { useRouter } from 'expo-router';

/** Returns the mock router object shared across all components in a test. */
export function getMockRouter() {
  return (useRouter as jest.Mock)();
}
