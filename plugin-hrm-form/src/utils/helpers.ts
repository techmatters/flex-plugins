import { isValid } from 'date-fns';

export const splitDate = (date: string) => date.split('-').map(s => parseInt(s, 10));

export const splitTime = (time: string) => time.split(':').map(s => parseInt(s, 10));

/**
 * If the provided object includes valid date and time, returns the corresponding Date object, returns Date.now otherwise
 * Use of getTime() means this will return the Date based on the browser's locale.
 */
export const getDateTime = ({ date, time }: { date?: string; time?: string }) => {
  if (date && time) {
    const [y, m, d] = splitDate(date);
    const [hh, mm] = splitTime(time);

    const dateTime = new Date(y, m - 1, d, hh, mm).getTime();

    if (isValid(dateTime)) return dateTime;
  }

  return Date.now();
};
