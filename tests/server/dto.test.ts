import { serializeDate } from '@server/dto';

describe('serializeDate', () => {
  it('serializes SQLite Date values for Next.js props', () => {
    expect(serializeDate(new Date('2026-04-28T08:55:04.821Z'))).toBe('2026-04-28T08:55:04.821Z');
  });

  it('preserves MySQL string values', () => {
    expect(serializeDate('2026-04-28 08:55:04')).toBe('2026-04-28 08:55:04');
  });
});
