import periodBounds from '../period';

describe('selected period boundaries', () => {
  it.each([
    [1, '2024-02-01', '2024-02-29'],
    [3, '2024-01-01', '2024-03-31'],
    [6, '2024-01-01', '2024-06-30'],
    [12, '2024-01-01', '2024-12-31'],
  ])('selects a complete %s-month period, including leap years', (range, start, end) => {
    expect(periodBounds('2024-02-07', range)).toEqual({ start, end });
  });
  it('selects the second semester and last quarter', () => {
    expect(periodBounds('2026-10-07', 6)).toEqual({ start: '2026-07-01', end: '2026-12-31' });
    expect(periodBounds('2026-10-07', 3)).toEqual({ start: '2026-10-01', end: '2026-12-31' });
  });
});
