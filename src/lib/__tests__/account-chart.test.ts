import accountChartPoints from '../account-chart';

describe('account balance chart', () => {
  it('preserves all twelve monthly snapshots for an annual response', () => {
    const entries = Object.fromEntries(Array.from({ length: 12 }, (_, month) => [
      `2024-${String(month + 1).padStart(2, '0')}-01`, String(month * 10),
    ]));
    expect(accountChartPoints(entries, 12)).toHaveLength(12);
  });

  it('uses the last balance per month and sorts dates chronologically', () => {
    expect(accountChartPoints({
      '2024-02-29': '90',
      '2024-01-31': '50',
      '2024-01-01': '10',
      '2024-02-01': '70',
    }, 12)).toEqual([
      { x: new Date('2024-01-31').getTime(), y: 50 },
      { x: new Date('2024-02-29').getTime(), y: 90 },
    ]);
  });

  it('keeps daily detail for short ranges and excludes invalid data', () => {
    expect(accountChartPoints({
      '2024-01-01': '0', '2024-01-02': '-10', invalid: '20', '2024-01-03': 'invalid',
    }, 1).map((point) => point.y)).toEqual([0, -10]);
    expect(accountChartPoints({}, 12)).toEqual([]);
  });
});
