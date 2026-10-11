export default function accountChartPoints(entries: Record<string, string>, range: number) {
  const points = Object.entries(entries)
    .map(([date, value]) => ({ x: new Date(date).getTime(), y: parseFloat(value) }))
    .filter(({ x, y }) => Number.isFinite(x) && Number.isFinite(y))
    .sort((a, b) => a.x - b.x);

  if (range <= 3) return points;

  // A balance is a snapshot: retain the last available balance of each month.
  const months = new Map<string, { x: number; y: number }>();
  points.forEach((point) => {
    const date = new Date(point.x);
    months.set(`${date.getUTCFullYear()}-${date.getUTCMonth()}`, point);
  });
  return Array.from(months.values());
}
