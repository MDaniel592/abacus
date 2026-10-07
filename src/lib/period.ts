import moment from 'moment';

export default function periodBounds(anchor: Date | string, range: number) {
  const size = [1, 3, 6, 12].includes(range) ? range : 1;
  const date = moment(anchor);
  const start = date.clone().startOf('year').add(Math.floor(date.month() / size) * size, 'months');
  return { start: start.format('YYYY-MM-DD'), end: start.clone().add(size, 'months').subtract(1, 'day').format('YYYY-MM-DD') };
}
