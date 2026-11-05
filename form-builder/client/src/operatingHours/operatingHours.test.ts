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
import fs from 'fs';
import path from 'path';

import { describe, expect, test } from '@jest/globals';
import { OPERATING_INFO_FILE, type OperatingInfo } from '@tech-matters/form-builder-shared';

import { formDefinitionsDir } from '../testing/workspaceHarness';
import {
  emptyWeek,
  formatTime,
  operatingHoursIssues,
  parseTime,
  publicHolidays,
  splitOvernight,
  statusAt,
  summarizeOperatingHoursChanges,
  wallTimeIn,
  wallTimeOf,
} from './operatingHours';

const usnm = JSON.parse(
  fs.readFileSync(path.join(formDefinitionsDir, '../../../account-scoped/src/operatingInfo/usnm.json'), 'utf8'),
) as OperatingInfo;

// 2026-11-02 is a Monday; 2026-11-26 is Thanksgiving
const at = (date: string, time: string) => wallTimeOf(date, time);

describe('what a flow is told, as the Lambda works it out', () => {
  test('open during a shift, closed outside it and on days without one', () => {
    expect(statusAt(usnm, 'sms', '', at('2026-11-02', '10:00'))).toEqual({ status: 'open', schedule: '' });
    expect(statusAt(usnm, 'sms', '', at('2026-11-02', '21:59')).status).toBe('open');
    // The closing time itself is closed
    expect(statusAt(usnm, 'sms', '', at('2026-11-02', '22:00')).status).toBe('closed');
    expect(statusAt(usnm, 'sms', '', at('2026-11-07', '12:00')).status).toBe('closed');
  });

  test('a holiday closes the day', () => {
    expect(statusAt(usnm, 'voice', '', at('2026-11-26', '12:00'))).toEqual({
      status: 'holiday',
      schedule: '',
      holiday: 'Thanksgiving Day',
    });
  });

  test('an office has its own hours; one without the channel, or not there, uses the main schedule', () => {
    expect(statusAt(usnm, 'sms', 'preClosing', at('2026-11-02', '21:50'))).toEqual({
      status: 'closed',
      schedule: 'preClosing',
    });
    expect(statusAt(usnm, 'sms', 'noSuchOffice', at('2026-11-02', '21:50'))).toEqual({ status: 'open', schedule: '' });
    const withWebchatOnlyInMain = {
      ...usnm,
      operatingHours: { ...usnm.operatingHours, webchat: usnm.operatingHours.sms },
    };
    expect(statusAt(withWebchatOnlyInMain, 'webchat', 'preClosing', at('2026-11-02', '21:50')).status).toBe('open');
  });

  test('a channel the main schedule doesn’t have fails', () => {
    expect(statusAt(usnm, 'whatsapp', '', at('2026-11-02', '12:00')).status).toBe('error');
  });

  test('the time where the schedule is', () => {
    // 2026-11-02 15:30 UTC is 10:30 in New York
    expect(wallTimeIn('America/New_York', new Date('2026-11-02T15:30:00Z'))).toMatchObject({
      day: '1',
      time: 1030,
      dateKey: '11/02/2026',
    });
  });
});

describe('times and shifts', () => {
  test('times as the file has them', () => {
    expect(formatTime(1000)).toBe('10:00');
    expect(formatTime(2145)).toBe('21:45');
    expect(parseTime('09:30')).toBe(930);
    // Midnight as a closing time is the end of the day
    expect(parseTime('00:00', true)).toBe(2400);
  });

  test('an overnight shift is split across midnight', () => {
    const week = { ...emptyWeek(), '5': [{ open: 2200, close: 200 }], '6': [{ open: 1000, close: 1400 }] };
    const split = splitOvernight(week, '5', 0);
    expect(split['5']).toEqual([{ open: 2200, close: 2400 }]);
    expect(split['6']).toEqual([
      { open: 0, close: 200 },
      { open: 1000, close: 1400 },
    ]);
    // Sunday's goes on to Monday
    expect(splitOvernight({ ...emptyWeek(), '7': [{ open: 2300, close: 100 }] }, '7', 0)['1']).toEqual([
      { open: 0, close: 100 },
    ]);
  });
});

describe('checks', () => {
  test('USNM’s hours are fine, and match what its flows ask for', () => {
    expect(
      operatingHoursIssues(usnm, [
        { file: 'usnm/templates/studio-flows/sms.tftpl', channel: 'sms', office: 'preClosing', dynamic: false },
      ]),
    ).toEqual([]);
  });

  test('what would break the check, and what falls back to the main schedule', () => {
    const broken: OperatingInfo = {
      timezone: 'Mars/Olympus',
      holidays: { '2026-12-25': 'Christmas' },
      operatingHours: { sms: { ...emptyWeek(), '1': [{ open: 2200, close: 200 }] }, voice: { '1': [] } },
    };
    const messages = operatingHoursIssues(broken, [
      { file: 'x/webchat.tftpl', channel: 'webchat', dynamic: false },
      { file: 'x/sms.tftpl', channel: 'sms', office: 'night', dynamic: false },
      { file: 'x/any.tftpl', channel: '{{flow.channel}}', dynamic: true },
    ]).map(issue => `${issue.severity}: ${issue.message}`);
    expect(messages).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^error: The time zone .* isn’t one Aselo knows/),
        expect.stringMatching(/^error: sms in the main schedule, Monday: 22:00 to 02:00 goes past midnight/),
        expect.stringMatching(/^error: voice in the main schedule: Tuesday is missing/),
        expect.stringMatching(/^error: A holiday .* can’t read/),
        expect.stringMatching(/^error: x\/webchat.tftpl checks “webchat”, which the main schedule doesn’t have/),
        expect.stringMatching(
          /^warning: x\/sms.tftpl checks the office “night”, which isn’t here: the main schedule is used/,
        ),
      ]),
    );
    // Worked out when the flow runs: not checked
    expect(messages.some(message => message.includes('{{'))).toBe(false);
  });
});

test('public holidays for a country and year', async () => {
  const holidays = await publicHolidays('US', undefined, 2026);
  expect(holidays['01/01/2026']).toBe('New Year’s Day'.replace('’', "'"));
  expect(holidays['11/26/2026']).toBe('Thanksgiving Day');
});

test('the review says what changed, and that the Lambda needs deploying', () => {
  const changed: OperatingInfo = {
    ...usnm,
    holidays: { ...usnm.holidays, '12/31/2026': 'New Year’s Eve' },
    operatingHours: { ...usnm.operatingHours, sms: { ...usnm.operatingHours.sms, '6': [{ open: 1000, close: 1400 }] } },
  };
  expect(
    summarizeOperatingHoursChanges({ [OPERATING_INFO_FILE]: usnm }, { [OPERATING_INFO_FILE]: changed })[0].lines,
  ).toEqual(['Changed the hours for sms', '1 holiday added', 'Deploy the account-scoped Lambda once merged.']);
  expect(summarizeOperatingHoursChanges({}, { [OPERATING_INFO_FILE]: usnm })[0].lines[0]).toMatch(/^Set up/);
});
