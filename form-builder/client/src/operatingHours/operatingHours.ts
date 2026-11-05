/**
 * Copyright (C) 2021-2026 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

/**
 * A helpline's operating hours, as the account-scoped Lambda reads them
 * (lambdas/account-scoped/src/operatingHours.ts): the main schedule and other named ones
 * ("offices"), each with a time zone, holidays and hours per channel. Everything here follows
 * what the Lambda does:
 *
 * - days 1 (Monday) to 7 (Sunday), every one there (a missing day breaks the check), each with
 *   shifts open (HHMM) until close, close not included; nothing goes past midnight, so an
 *   overnight shift is two (until 24:00, then from 00:00 the next day);
 * - a holiday (MM/DD/YYYY) closes the whole day, every channel;
 * - an office the flow asks for that isn't there, or doesn't have the channel, uses the main
 *   schedule; a channel the main schedule doesn't have fails the check.
 */
import {
  OPERATING_INFO_FILE,
  type OperatingHoursUsage,
  type OperatingInfo,
  type OperatingSchedule,
  type OperatingShift,
  type OperatingWeek,
} from '@tech-matters/form-builder-shared';

import type { DefinitionFileMap } from '../common/definitions';

export const DAYS = [
  { key: '1', label: 'Monday' },
  { key: '2', label: 'Tuesday' },
  { key: '3', label: 'Wednesday' },
  { key: '4', label: 'Thursday' },
  { key: '5', label: 'Friday' },
  { key: '6', label: 'Saturday' },
  { key: '7', label: 'Sunday' },
];
export const WEEKDAYS = ['1', '2', '3', '4', '5'];

// The channels Aselo's flows check (any name the flow sends works)
export const KNOWN_CHANNELS = ['voice', 'sms', 'webchat', 'whatsapp', 'facebook', 'instagram', 'telegram', 'line'];

// The main schedule, as opposed to an office
export const MAIN = '';

export const getOperatingInfo = (files: DefinitionFileMap) => files[OPERATING_INFO_FILE] as OperatingInfo | undefined;

export const emptyWeek = (): OperatingWeek => Object.fromEntries(DAYS.map(({ key }) => [key, []]));

export const newOperatingInfo = (timezone: string, channels: string[]): OperatingInfo => ({
  timezone,
  holidays: {},
  operatingHours: Object.fromEntries(channels.map(channel => [channel, emptyWeek()])),
});

export const scheduleOf = (info: OperatingInfo, office: string): OperatingSchedule | undefined => {
  if (office === MAIN) {
    const { offices: _offices, ...main } = info;
    return main;
  }
  return info.offices?.[office];
};

export const withSchedule = (info: OperatingInfo, office: string, schedule: OperatingSchedule): OperatingInfo =>
  office === MAIN
    ? { ...schedule, ...(info.offices ? { offices: info.offices } : {}) }
    : { ...info, offices: { ...info.offices, [office]: schedule } };

export const officesOf = (info: OperatingInfo) => Object.keys(info.offices ?? {});

// 1000 -> '10:00', 2400 -> '24:00'
export const formatTime = (time: number) =>
  `${String(Math.floor(time / 100)).padStart(2, '0')}:${String(time % 100).padStart(2, '0')}`;

// '10:00' -> 1000; '00:00' as a closing time means midnight at the end of the day (2400)
export const parseTime = (text: string, isClose = false) => {
  const match = text.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return undefined;
  const time = Number(match[1]) * 100 + Number(match[2]);
  return isClose && time === 0 ? 2400 : time;
};

const nextDay = (day: string) => String((Number(day) % 7) + 1);

export const isOvernight = (shift: OperatingShift) => shift.close <= shift.open && shift.close !== 2400;

/**
 * An overnight shift (22:00 to 02:00) as the Lambda needs it: until 24:00 that day, and from
 * 00:00 the next day.
 */
export const splitOvernight = (week: OperatingWeek, day: string, index: number): OperatingWeek => {
  const shift = week[day][index];
  if (!isOvernight(shift)) return week;
  const following = nextDay(day);
  return {
    ...week,
    [day]: week[day].map((each, at) => (at === index ? { open: shift.open, close: 2400 } : each)),
    [following]: [{ open: 0, close: shift.close }, ...week[following]].sort((a, b) => a.open - b.open),
  };
};

// "Copy Monday to weekdays" and the like
export const copyDay = (week: OperatingWeek, from: string, to: string[]): OperatingWeek => ({
  ...week,
  ...Object.fromEntries(to.map(day => [day, week[from].map(shift => ({ ...shift }))])),
});

const pad = (value: number) => String(value).padStart(2, '0');

// MM/DD/YYYY <-> YYYY-MM-DD (a date input's value)
export const holidayKeyOf = (isoDate: string) => {
  const [year, month, day] = isoDate.split('-');
  return `${month}/${day}/${year}`;
};
const isoDateOf = (key: string) => {
  const [month, day, year] = key.split('/');
  return `${year}-${month}-${day}`;
};

export const sortedHolidays = (holidays: Record<string, string>) =>
  Object.entries(holidays)
    .map(([key, name]) => ({ key, name, iso: isoDateOf(key) }))
    .sort((a, b) => a.iso.localeCompare(b.iso));

// What the time is in a time zone: its day of the week (1-7), HHMM and date as the Lambda reads them
export const wallTimeIn = (timezone: string, at: Date) => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'short',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(at)
      .map(part => [part.type, part.value]),
  );
  const day = String(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(parts.weekday) + 1);
  return {
    day,
    time: (Number(parts.hour) % 24) * 100 + Number(parts.minute),
    dateKey: `${parts.month}/${parts.day}/${parts.year}`,
    label: `${parts.weekday} ${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`,
  };
};

// A date and time as written (in the schedule's own time zone): no time zone maths needed
export const wallTimeOf = (isoDate: string, time: string) => {
  const [year, month, day] = isoDate.split('-').map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return { day: String(weekday === 0 ? 7 : weekday), time: parseTime(time) ?? 0, dateKey: holidayKeyOf(isoDate) };
};

type OperatingStatus =
  | { status: 'open' | 'closed' | 'holiday'; schedule: string; holiday?: string }
  | { status: 'error'; message: string };

/** What the Lambda would answer for a channel (and office) at a time in the schedule's zone. */
export const statusAt = (
  info: OperatingInfo,
  channel: string,
  office: string,
  wallTime: { day: string; time: number; dateKey: string },
): OperatingStatus => {
  const officeSchedule = office === MAIN ? undefined : info.offices?.[office];
  // An office without the channel (or not there at all) uses the main schedule
  const [name, schedule] =
    officeSchedule?.operatingHours[channel] === undefined ? [MAIN, scheduleOf(info, MAIN)!] : [office, officeSchedule];
  const week = schedule.operatingHours[channel];
  if (!week) return { status: 'error', message: `No hours for “${channel}”: the check fails.` };
  if (wallTime.dateKey in schedule.holidays) {
    return { status: 'holiday', schedule: name, holiday: schedule.holidays[wallTime.dateKey] };
  }
  const shifts = week[wallTime.day];
  if (!shifts) return { status: 'error', message: 'A day is missing from these hours: the check fails.' };
  const open = shifts.some(shift => wallTime.time >= shift.open && wallTime.time < shift.close);
  return { status: open ? 'open' : 'closed', schedule: name };
};

type OperatingHoursIssue = { severity: 'error' | 'warning'; message: string };

const isValidTimeZone = (timezone: string) => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format();
    return Boolean(timezone);
  } catch {
    return false;
  }
};

const isValidTime = (time: number) => Number.isInteger(time) && time >= 0 && time <= 2400 && time % 100 < 60;

const scheduleName = (office: string) => (office === MAIN ? 'the main schedule' : `“${office}”`);

// eslint-disable-next-line sonarjs/cognitive-complexity
const scheduleIssues = (schedule: OperatingSchedule, office: string): OperatingHoursIssue[] => {
  const issues: OperatingHoursIssue[] = [];
  const where = scheduleName(office);
  if (!isValidTimeZone(schedule.timezone)) {
    issues.push({
      severity: 'error',
      message: `The time zone of ${where} isn’t one Aselo knows (“${schedule.timezone}”).`,
    });
  }
  Object.entries(schedule.operatingHours).forEach(([channel, week]) => {
    DAYS.forEach(({ key, label }) => {
      const shifts = week[key];
      if (!shifts) {
        issues.push({
          severity: 'error',
          message: `${channel} in ${where}: ${label} is missing (the check fails on ${label}s).`,
        });
        return;
      }
      shifts.forEach(shift => {
        if (!isValidTime(shift.open) || !isValidTime(shift.close)) {
          issues.push({ severity: 'error', message: `${channel} in ${where}, ${label}: a time isn’t a time of day.` });
        } else if (shift.open >= shift.close) {
          issues.push({
            severity: 'error',
            message: `${channel} in ${where}, ${label}: ${formatTime(shift.open)} to ${formatTime(
              shift.close,
            )} goes past midnight; split it across midnight.`,
          });
        }
      });
      const sorted = [...shifts].sort((a, b) => a.open - b.open);
      if (sorted.some((shift, index) => index > 0 && shift.open < sorted[index - 1].close)) {
        issues.push({ severity: 'warning', message: `${channel} in ${where}, ${label}: hours overlap.` });
      }
    });
  });
  Object.keys(schedule.holidays).forEach(key => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(key) || Number.isNaN(Date.parse(isoDateOf(key)))) {
      issues.push({ severity: 'error', message: `A holiday in ${where} has a date Aselo can’t read (“${key}”).` });
    }
  });
  return issues;
};

/**
 * What would go wrong: in the schedules themselves, and against what the helpline's Studio flows
 * ask for (a channel the main schedule doesn't have fails the check, and the contact takes the
 * flow's failure path).
 */
export const operatingHoursIssues = (
  info: OperatingInfo,
  usages: OperatingHoursUsage[] = [],
): OperatingHoursIssue[] => {
  const main = scheduleOf(info, MAIN)!;
  const issues = [
    ...scheduleIssues(main, MAIN),
    ...officesOf(info).flatMap(office => scheduleIssues(info.offices![office], office)),
  ];
  officesOf(info)
    .filter(office => !/^[A-Za-z0-9_-]+$/.test(office))
    .forEach(office =>
      issues.push({
        severity: 'warning',
        message: `The office “${office}” has characters a flow may not send as written.`,
      }),
    );
  if (Object.keys(main.operatingHours).length === 0) {
    issues.push({ severity: 'error', message: 'The main schedule has no channels: every check fails.' });
  }
  const checked = new Set<string>();
  usages
    .filter(usage => !usage.dynamic && usage.channel)
    .forEach(({ file, channel, office }) => {
      const id = `${channel}|${office ?? ''}`;
      if (checked.has(id)) return;
      checked.add(id);
      if (!main.operatingHours[channel!]) {
        issues.push({
          severity: 'error',
          message: `${file} checks “${channel}”, which the main schedule doesn’t have: the check fails and contacts take the flow’s failure path.`,
        });
      }
      if (office && !info.offices?.[office]) {
        issues.push({
          severity: 'warning',
          message: `${file} checks the office “${office}”, which isn’t here: the main schedule is used.`,
        });
      } else if (office && !info.offices![office].operatingHours[channel!]) {
        issues.push({
          severity: 'warning',
          message: `${file} checks “${channel}” for the office “${office}”, which doesn’t have it: the main schedule’s hours are used.`,
        });
      }
    });
  return issues;
};

/**
 * A country's (or region's) public holidays for a year, from date-holidays (offline, loaded
 * only when asked for): MM/DD/YYYY -> name
 */
export const publicHolidays = async (country: string, region: string | undefined, year: number) => {
  const { default: Holidays } = await import('date-holidays');
  const holidays = region ? new Holidays(country, region) : new Holidays(country);
  return Object.fromEntries(
    (holidays.getHolidays(year) || [])
      .filter(holiday => holiday.type === 'public')
      .map(holiday => [holidayKeyOf(holiday.date.slice(0, 10)), holiday.name]),
  );
};

export const holidayCountries = async () => {
  const { default: Holidays } = await import('date-holidays');
  return Object.entries(new Holidays().getCountries('en'))
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const holidayRegions = async (country: string) => {
  const { default: Holidays } = await import('date-holidays');
  return Object.entries(new Holidays().getStates(country, 'en') ?? {})
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

const describeWeek = (week?: OperatingWeek) => JSON.stringify(week ?? null);

const scheduleChanges = (before: OperatingSchedule | undefined, after: OperatingSchedule, office: string): string[] => {
  const where = office === MAIN ? '' : ` (${office})`;
  if (!before) return [`Added the office${where}`];
  const lines: string[] = [];
  if (before.timezone !== after.timezone) lines.push(`Time zone${where}: ${before.timezone} → ${after.timezone}`);
  const channels = [...new Set([...Object.keys(before.operatingHours), ...Object.keys(after.operatingHours)])];
  channels.forEach(channel => {
    if (!(channel in before.operatingHours)) lines.push(`Added ${channel}${where}`);
    else if (!(channel in after.operatingHours)) lines.push(`Removed ${channel}${where}`);
    else if (describeWeek(before.operatingHours[channel]) !== describeWeek(after.operatingHours[channel])) {
      lines.push(`Changed the hours for ${channel}${where}`);
    }
  });
  const added = Object.keys(after.holidays).filter(key => !(key in before.holidays)).length;
  const removed = Object.keys(before.holidays).filter(key => !(key in after.holidays)).length;
  if (added) lines.push(`${added} holiday${added === 1 ? '' : 's'} added${where}`);
  if (removed) lines.push(`${removed} holiday${removed === 1 ? '' : 's'} removed${where}`);
  return lines;
};

/** What a draft changes in the operating hours, for "Review your changes". */
export const summarizeOperatingHoursChanges = (
  originalFiles: DefinitionFileMap,
  draftFiles: DefinitionFileMap,
): { title: string; lines: string[] }[] => {
  const before = getOperatingInfo(originalFiles);
  const after = getOperatingInfo(draftFiles);
  if (JSON.stringify(before) === JSON.stringify(after)) return [];
  if (!after) return [{ title: 'Operating hours', lines: ['Removed'] }];
  const lines = [
    ...(before ? [] : ['Set up (lambdas/account-scoped/src/operatingInfo)']),
    ...(before ? scheduleChanges(scheduleOf(before, MAIN), scheduleOf(after, MAIN)!, MAIN) : []),
    ...officesOf(after).flatMap(office => scheduleChanges(before?.offices?.[office], after.offices![office], office)),
    ...(before
      ? officesOf(before)
          .filter(office => !after.offices?.[office])
          .map(office => `Removed the office ${office}`)
      : []),
    'Deploy the account-scoped Lambda once merged.',
  ];
  return [{ title: 'Operating hours', lines }];
};
