import { splitDate, splitTime, getDateTime } from '../../utils/helpers';

test('splitDate', () => {
  expect(splitDate('1-1-1')).toEqual([1, 1, 1]);
  expect(splitDate('10-10-10')).toEqual([10, 10, 10]);

  expect(splitDate('-10-12')).toEqual([NaN, 10, 12]);
  expect(splitDate('2014--12')).toEqual([2014, NaN, 12]);
  expect(splitDate('2014-10-')).toEqual([2014, 10, NaN]);
});

test('splitTime', () => {
  expect(splitTime('1:1')).toEqual([1, 1]);
  expect(splitTime('10:10')).toEqual([10, 10]);

  expect(splitTime(':10')).toEqual([NaN, 10]);
  expect(splitTime('10:')).toEqual([10, NaN]);
});

test('getDateTime', () => {
  expect(getDateTime({ date: '2020-11-24', time: '12:00' })).toEqual(new Date(2020, 10, 24, 12, 0).getTime());
  expect(getDateTime({ date: '2021-06-24', time: '12:00' })).toEqual(new Date(2021, 5, 24, 12, 0).getTime());
  expect(getDateTime({ date: '2021-6-24', time: '12:00' })).toEqual(new Date(2021, 5, 24, 12, 0).getTime());

  // 2 ms of tolerance for the tests is enough so far
  expect(Date.now() - getDateTime({})).toBeLessThan(2);
  expect(Date.now() - getDateTime({ date: '2021-wrong- 24', time: '12:00' })).toBeLessThan(2);
  expect(Date.now() - getDateTime({ date: '2020-11-24', time: 'wrong' })).toBeLessThan(2);
});
