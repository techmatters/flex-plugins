import { convertDurationToSeconds } from '../../../components/teamsView/teamsViewSorting';

describe('convertDurationToSeconds should convert', () => {
  test('seconds', () => {
    const input = '59s';
    const expected = 59;
    expect(convertDurationToSeconds(input)).toEqual(expected);
  });

  test('minutes and seconds with :', () => {
    const input = '59:59';
    const expected = 59 * 60 + 59;
    expect(convertDurationToSeconds(input)).toEqual(expected);
  });

  test('hours', () => {
    const input = '23h';
    const expected = 23 * 60 * 60;
    expect(convertDurationToSeconds(input)).toEqual(expected);
  });

  test('hours and minutes', () => {
    const input = '23h 59min';
    const expected = 23 * 60 * 60 + 59 * 60;
    expect(convertDurationToSeconds(input)).toEqual(expected);
  });

  test('days', () => {
    const input = '59d';
    const expected = 59 * 24 * 60 * 60;
    expect(convertDurationToSeconds(input)).toEqual(expected);
  });

  test('days and hours', () => {
    const input = '5d 3h';
    const expected = 5 * 24 * 60 * 60 + 3 * 60 * 60;
    expect(convertDurationToSeconds(input)).toEqual(expected);
  });

  test('more than 30 days', () => {
    const input = '30+d';
    const expected = 30 * 24 * 60 * 60;
    expect(convertDurationToSeconds(input)).toEqual(expected);
  });
});
