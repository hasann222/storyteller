import { generateId } from '../../src/utils/id';

describe('generateId', () => {
  it('returns a string', () => {
    expect(typeof generateId()).toBe('string');
  });

  it('returns a non-empty string', () => {
    expect(generateId().length).toBeGreaterThan(0);
  });

  it('successive calls return unique values', () => {
    const ids = Array.from({ length: 10 }, generateId);
    expect(new Set(ids).size).toBe(10);
  });
});
