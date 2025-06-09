import { generateId, getCurrentISODate } from '../src/utils/utils';

describe('utils', () => {
  test('generateId returns unique id', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toEqual(id2);
    expect(typeof id1).toBe('string');
  });

  test('getCurrentISODate returns ISO string', () => {
    const iso = getCurrentISODate();
    expect(iso).toMatch(/\d{4}-\d{2}-\d{2}T/);
  });
});
