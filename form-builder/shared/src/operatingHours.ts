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
 * A helpline's operating hours as the account-scoped Lambda reads them
 * (lambdas/account-scoped/src/operatingHours.ts, operatingInfo/<code>.json): a schedule (time
 * zone, holidays, hours per channel) and other named schedules ("offices") a Studio flow can ask
 * about instead.
 */
// Times as numbers: 1000 is 10:00, 2145 is 21:45; open until (not including) close
export type OperatingShift = { open: number; close: number };
// Days 1 (Monday) to 7 (Sunday); every day must be there, closed days with no shifts
export type OperatingWeek = Record<string, OperatingShift[]>;
export type OperatingSchedule = {
  timezone: string;
  // MM/DD/YYYY -> its name: closed all day, every channel
  holidays: Record<string, string>;
  operatingHours: Record<string, OperatingWeek>;
};
export type OperatingInfo = OperatingSchedule & { offices?: Record<string, OperatingSchedule> };

// A Studio flow asking the operatingHours route about a channel (and office)
export type OperatingHoursUsage = {
  // Under twilio-iac/helplines
  file: string;
  channel?: string;
  office?: string;
  // Worked out when the flow runs ("{{...}}"), so it can't be checked here
  dynamic: boolean;
};

// What the helpline's operating hours file has, for the flow designer to offer
export type OperatingHoursChoices = { hasOperatingHours: boolean; channels: string[]; offices: string[] };
