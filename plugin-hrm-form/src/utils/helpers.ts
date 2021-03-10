import { isValid } from 'date-fns';

export const splitDate = (date: string) => date.split('-').map(s => parseInt(s, 10));

export const splitTime = (time: string) => time.split(':').map(s => parseInt(s, 10));

/**
 * If the provided object includes valid date and time, returns the corresponding Date object, returns Date.now otherwise
 * Use of getTime() means this will return the Date based on the browser's locale.
 */
export const getDateTime = ({ date, time }: { date?: string; time?: string }) => {
  if (date) {
    const [y, m, d] = splitDate(date);
    const [hh, mm] = time ? splitTime(time) : [0, 0];

    const dateTime = new Date(y, m - 1, d, hh, mm).getTime();

    if (isValid(dateTime)) return dateTime;
  }

  return Date.now();
};

/**
 * Gets the local format for the provided timestamp.
 * Valid timestamp examples:
 * - 2021-03-05T20:43:28.498Z (include time)
 * - 2021-03-07 (only date)
 * @param timestamp Timestamp to convert, may include time or not.
 */
export const getLocaleDateTime = (timestamp: string): string => {
  const [date, time] = timestamp.split('T');

  const dateTime = getDateTime({ date, time });

  return new Date(dateTime).toLocaleDateString(navigator.language);
};
