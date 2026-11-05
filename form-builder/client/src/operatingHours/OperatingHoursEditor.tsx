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
 * Aselo staff only: when the helpline is open (lambdas/account-scoped/src/operatingInfo/<code>.json),
 * per schedule (the main one and the offices a flow can ask for): its time zone, its hours per
 * channel and day, and its holidays, checked against what the helpline's Studio flows ask for,
 * with "Check a time" answering as the Lambda would. State and logic live in
 * operatingHoursSlice.ts and operatingHours.ts.
 */
import { useEffect, useState } from 'react';
import type { OperatingSchedule, OperatingShift } from '@tech-matters/form-builder-shared';

import { useAppDispatch, useAppSelector } from '../app/store';
import { SectionTitle } from '../help/HelpContext';
import { selectWorkspace, viewSelected } from '../workspace/workspaceSlice';
import {
  DAYS,
  formatTime,
  holidayCountries,
  holidayKeyOf,
  holidayRegions,
  isOvernight,
  KNOWN_CHANNELS,
  MAIN,
  officesOf,
  parseTime,
  sortedHolidays,
  statusAt,
  wallTimeIn,
  wallTimeOf,
  WEEKDAYS,
} from './operatingHours';
import {
  addChannel,
  addOffice,
  addPublicHolidays,
  applyHoursToAllChannels,
  channelChosen,
  checkChanged,
  copyDayTo,
  holidayImportChanged,
  openOperatingHours,
  removeChannel,
  removeOffice,
  removePastHolidays,
  scheduleChosen,
  selectOperatingHoursEditor,
  selectOperatingHoursIssues,
  selectOperatingInfo,
  selectShownSchedule,
  setHoliday,
  setShifts,
  setTimezone,
  setUpOperatingHours,
  splitShiftOvernight,
} from './operatingHoursSlice';
import './operatingHours.css';

// Every time zone the browser knows, for the time zone picker
const TIME_ZONES: string[] = (() => {
  try {
    return (Intl as unknown as { supportedValuesOf: (key: string) => string[] }).supportedValuesOf('timeZone');
  } catch {
    return [];
  }
})();

const TimeZonePicker = ({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (zone: string) => void;
  label: string;
}) => (
  <>
    <input
      type="text"
      list="operating-time-zones"
      aria-label={label}
      value={value}
      placeholder="e.g. America/New_York"
      onChange={e => onChange(e.target.value)}
    />
    <datalist id="operating-time-zones">
      {TIME_ZONES.map(zone => (
        <option key={zone} value={zone} />
      ))}
    </datalist>
  </>
);

const nowIn = (timezone: string) => {
  try {
    return wallTimeIn(timezone, new Date()).label;
  } catch {
    return undefined;
  }
};

// One day's shifts for a channel: closed, or open from–to (several shifts if needed)
const DayRow = ({
  channel,
  day,
  label,
  shifts,
}: {
  channel: string;
  day: string;
  label: string;
  shifts: OperatingShift[];
}) => {
  const dispatch = useAppDispatch();
  const update = (next: OperatingShift[]) => dispatch(setShifts(channel, day, next));
  const changeTime = (index: number, field: 'open' | 'close', text: string) => {
    const time = parseTime(text, field === 'close');
    if (time === undefined) return;
    update(shifts.map((shift, at) => (at === index ? { ...shift, [field]: time } : shift)));
  };
  return (
    <tr>
      <th scope="row">{label}</th>
      <td>
        {shifts.length === 0 && <span className="muted">Closed</span>}
        {shifts.map((shift, index) => (
          <div key={index} className="operating-shift">
            <input
              type="time"
              aria-label={`${label} opens`}
              value={formatTime(shift.open)}
              onChange={e => changeTime(index, 'open', e.target.value)}
            />
            <span>to</span>
            <input
              type="time"
              aria-label={`${label} closes`}
              value={formatTime(shift.close === 2400 ? 0 : shift.close)}
              onChange={e => changeTime(index, 'close', e.target.value)}
            />
            {shift.close === 2400 && <span className="muted">midnight</span>}
            <button
              type="button"
              className="link-button"
              aria-label={`Remove ${label} ${formatTime(shift.open)}`}
              onClick={() => update(shifts.filter((_shift, at) => at !== index))}
            >
              Remove
            </button>
            {isOvernight(shift) && (
              <span className="operating-overnight">
                Goes past midnight.{' '}
                <button
                  type="button"
                  className="link-button"
                  onClick={() => dispatch(splitShiftOvernight(channel, day, index))}
                >
                  Split across midnight
                </button>
              </span>
            )}
          </div>
        ))}
      </td>
      <td className="operating-day-actions">
        <button
          type="button"
          className="link-button"
          onClick={() => {
            const last = shifts[shifts.length - 1];
            update([...shifts, last ? { open: Math.min(last.close, 2300), close: 2400 } : { open: 900, close: 1700 }]);
          }}
        >
          Add hours
        </button>
        {day === '1' && (
          <button
            type="button"
            className="link-button"
            onClick={() => dispatch(copyDayTo(channel, '1', WEEKDAYS.slice(1)))}
          >
            Copy to Tuesday–Friday
          </button>
        )}
      </td>
    </tr>
  );
};

const ChannelHours = ({ schedule, channel }: { schedule: OperatingSchedule; channel: string }) => {
  const dispatch = useAppDispatch();
  const week = schedule.operatingHours[channel];
  const channels = Object.keys(schedule.operatingHours);
  return (
    <div className="operating-week">
      <table className="config-table operating-week-table">
        <thead>
          <tr>
            <th>Day</th>
            <th>Open ({channel})</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {DAYS.map(({ key, label }) => (
            <DayRow key={key} channel={channel} day={key} label={label} shifts={week[key] ?? []} />
          ))}
        </tbody>
      </table>
      <div className="operating-week-actions">
        {channels.length > 1 && (
          <button type="button" className="secondary-button" onClick={() => dispatch(applyHoursToAllChannels(channel))}>
            Use these hours for every channel
          </button>
        )}
        <button
          type="button"
          className="link-button"
          onClick={() => {
            if (window.confirm(`Remove ${channel} from this schedule?`)) dispatch(removeChannel(channel));
          }}
        >
          Remove {channel}
        </button>
      </div>
    </div>
  );
};

const AddChannel = ({ channels }: { channels: string[] }) => {
  const dispatch = useAppDispatch();
  // Typed until added
  const [name, setName] = useState('');
  const [copyFrom, setCopyFrom] = useState('');
  return (
    <form
      className="operating-add"
      onSubmit={e => {
        e.preventDefault();
        dispatch(addChannel(name, copyFrom || undefined));
        setName('');
      }}
    >
      <input
        type="text"
        list="operating-channels"
        aria-label="Add a channel"
        placeholder="Add a channel (e.g. whatsapp)"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <datalist id="operating-channels">
        {KNOWN_CHANNELS.filter(channel => !channels.includes(channel)).map(channel => (
          <option key={channel} value={channel} />
        ))}
      </datalist>
      {channels.length > 0 && (
        <select aria-label="Start from" value={copyFrom} onChange={e => setCopyFrom(e.target.value)}>
          <option value="">Closed every day</option>
          {channels.map(channel => (
            <option key={channel} value={channel}>
              Same hours as {channel}
            </option>
          ))}
        </select>
      )}
      <button type="submit" className="secondary-button" disabled={!name.trim() || channels.includes(name.trim())}>
        Add channel
      </button>
    </form>
  );
};

const Holidays = ({ schedule }: { schedule: OperatingSchedule }) => {
  const dispatch = useAppDispatch();
  const { holidayImport } = useAppSelector(selectOperatingHoursEditor);
  // Typed until added
  const [date, setDate] = useState('');
  const [name, setName] = useState('');
  const [countries, setCountries] = useState<{ code: string; name: string }[]>([]);
  const [regions, setRegions] = useState<{ code: string; name: string }[]>([]);
  const today = new Date().toISOString().slice(0, 10);
  const holidays = sortedHolidays(schedule.holidays);
  const pastCount = holidays.filter(holiday => holiday.iso < today).length;

  // The countries and regions date-holidays knows, loaded when needed
  useEffect(() => {
    holidayCountries().then(setCountries);
  }, []);
  useEffect(() => {
    if (holidayImport.country) holidayRegions(holidayImport.country).then(setRegions);
    else setRegions([]);
  }, [holidayImport.country]);

  return (
    <section className="panel" aria-labelledby="operating-holidays-title">
      <h3 id="operating-holidays-title">Holidays</h3>
      <p className="muted">Closed all day, on every channel, in {schedule.timezone}.</p>
      {holidays.length === 0 ? (
        <p className="muted">No holidays.</p>
      ) : (
        <ul className="operating-holidays">
          {holidays.map(holiday => (
            <li key={holiday.key} className={holiday.iso < today ? 'operating-past' : undefined}>
              <span className="operating-holiday-date">{holiday.iso}</span>
              <input
                type="text"
                aria-label={`Name of the holiday on ${holiday.iso}`}
                value={holiday.name}
                onChange={e => dispatch(setHoliday(holiday.key, e.target.value))}
              />
              <button
                type="button"
                className="link-button"
                aria-label={`Remove the holiday on ${holiday.iso}`}
                onClick={() => dispatch(setHoliday(holiday.key, undefined))}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      {pastCount > 0 && (
        <button type="button" className="link-button" onClick={() => dispatch(removePastHolidays(today))}>
          Remove {pastCount} past holiday{pastCount === 1 ? '' : 's'}
        </button>
      )}

      <form
        className="operating-add"
        onSubmit={e => {
          e.preventDefault();
          dispatch(setHoliday(holidayKeyOf(date), name.trim() || 'Holiday'));
          setDate('');
          setName('');
        }}
      >
        <input type="date" aria-label="Holiday date" value={date} onChange={e => setDate(e.target.value)} />
        <input
          type="text"
          aria-label="Holiday name"
          placeholder="Name (e.g. Christmas Day)"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <button type="submit" className="secondary-button" disabled={!date}>
          Add holiday
        </button>
      </form>

      <div className="operating-add operating-public-holidays">
        <span className="field-label">Add public holidays</span>
        <select
          aria-label="Country"
          value={holidayImport.country}
          onChange={e => dispatch(holidayImportChanged({ country: e.target.value, region: '' }))}
        >
          <option value="">Country…</option>
          {countries.map(country => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
        {regions.length > 0 && (
          <select
            aria-label="Region"
            value={holidayImport.region}
            onChange={e => dispatch(holidayImportChanged({ region: e.target.value }))}
          >
            <option value="">The whole country</option>
            {regions.map(region => (
              <option key={region.code} value={region.code}>
                {region.name}
              </option>
            ))}
          </select>
        )}
        <select
          aria-label="Year"
          value={holidayImport.year}
          onChange={e => dispatch(holidayImportChanged({ year: Number(e.target.value) }))}
        >
          {[0, 1, 2].map(offset => {
            const year = new Date().getFullYear() + offset;
            return (
              <option key={year} value={year}>
                {year}
              </option>
            );
          })}
        </select>
        <button
          type="button"
          className="secondary-button"
          disabled={!holidayImport.country || holidayImport.status === 'loading'}
          onClick={() => dispatch(addPublicHolidays())}
        >
          Add
        </button>
        {holidayImport.notice && <span className="muted">{holidayImport.notice}</span>}
      </div>
    </section>
  );
};

const CheckATime = ({ channels, offices }: { channels: string[]; offices: string[] }) => {
  const dispatch = useAppDispatch();
  const info = useAppSelector(selectOperatingInfo)!;
  const { check } = useAppSelector(selectOperatingHoursEditor);
  const channel = check.channel && channels.includes(check.channel) ? check.channel : channels[0];
  if (!channel) return null;
  const result = statusAt(info, channel, check.office, wallTimeOf(check.date, check.time));
  const describe = () => {
    if (result.status === 'error') return result.message;
    const where = result.schedule === MAIN ? 'main schedule' : `office “${result.schedule}”`;
    if (result.status === 'holiday') return `Holiday (${result.holiday}): closed. From the ${where}.`;
    return `${result.status === 'open' ? 'Open' : 'Closed'}, from the ${where}.`;
  };
  return (
    <section className="panel" aria-labelledby="operating-check-title">
      <h3 id="operating-check-title">Check a time</h3>
      <p className="muted">What a flow would be told, as the time is where the schedule is.</p>
      <div className="operating-add">
        <input
          type="date"
          aria-label="Date to check"
          value={check.date}
          onChange={e => dispatch(checkChanged({ date: e.target.value }))}
        />
        <input
          type="time"
          aria-label="Time to check"
          value={check.time}
          onChange={e => dispatch(checkChanged({ time: e.target.value }))}
        />
        <select
          aria-label="Channel to check"
          value={channel}
          onChange={e => dispatch(checkChanged({ channel: e.target.value }))}
        >
          {channels.map(each => (
            <option key={each} value={each}>
              {each}
            </option>
          ))}
        </select>
        <select
          aria-label="Office to check"
          value={check.office}
          onChange={e => dispatch(checkChanged({ office: e.target.value }))}
        >
          <option value={MAIN}>No office (main schedule)</option>
          {offices.map(office => (
            <option key={office} value={office}>
              {office}
            </option>
          ))}
        </select>
      </div>
      <p className={`operating-check-result operating-${result.status}`} role="status">
        {describe()}
      </p>
    </section>
  );
};

const SetUp = () => {
  const dispatch = useAppDispatch();
  const { usage } = useAppSelector(selectOperatingHoursEditor);
  // Chosen until set up
  const [timezone, setTimezoneText] = useState('');
  const channels = [...new Set(usage.usages.filter(each => !each.dynamic && each.channel).map(each => each.channel!))];
  return (
    <div>
      <p>
        This helpline has no operating hours, so its flows are always told it’s open. Set them up with its time zone:
        {channels.length > 0
          ? ` the channels its flows check (${channels.join(', ')}) start closed every day, until you set their hours.`
          : ' then add its channels and hours.'}
      </p>
      <div className="operating-add">
        <TimeZonePicker value={timezone} onChange={setTimezoneText} label="Time zone" />
        <button
          type="button"
          className="primary-button"
          disabled={!TIME_ZONES.includes(timezone) && !/^[A-Za-z_]+\/[A-Za-z_]+/.test(timezone)}
          onClick={() => dispatch(setUpOperatingHours(timezone))}
        >
          Set up operating hours
        </button>
      </div>
    </div>
  );
};

// eslint-disable-next-line complexity, sonarjs/cognitive-complexity
export const OperatingHoursEditor = () => {
  const dispatch = useAppDispatch();
  const { editorRevision } = useAppSelector(selectWorkspace);
  const info = useAppSelector(selectOperatingInfo);
  const { office, usage } = useAppSelector(selectOperatingHoursEditor);
  const { schedule, channels, channel } = useAppSelector(selectShownSchedule);
  const issues = useAppSelector(selectOperatingHoursIssues);
  // Typed until the office is added
  const [newOffice, setNewOffice] = useState('');

  // Afresh when it opens, and when the draft's files are replaced
  useEffect(() => {
    dispatch(openOperatingHours());
  }, [dispatch, editorRevision]);

  const offices = info ? officesOf(info) : [];
  const allChannels = info
    ? [
        ...new Set([
          ...Object.keys(info.operatingHours),
          ...offices.flatMap(each => Object.keys(info.offices![each].operatingHours)),
        ]),
      ]
    : [];

  return (
    <div className="operating-hours">
      <section className="panel">
        <SectionTitle>Operating hours</SectionTitle>
        <p className="muted">
          When the helpline is open, for the Check operating hours step of its flows: closed or on a holiday, the flow
          says so with the closed messages (in{' '}
          <button type="button" className="link-button" onClick={() => dispatch(viewSelected({ kind: 'messages' }))}>
            Automatic chat messages
          </button>
          ). Checked in production only, unless the Aselo team turns it on for staging. A change reaches flows after the
          PR is merged and the account-scoped Lambda deployed.
        </p>
        {usage.status === 'error' && (
          <p className="alert alert-error">Couldn’t read what the helpline’s flows check: {usage.error}</p>
        )}
        {!info && <SetUp />}
      </section>

      {info && (
        <>
          {issues.length > 0 && (
            <ul className="operating-issues" aria-label="Problems">
              {issues.map((issue, index) => (
                <li key={index} className={issue.severity === 'error' ? 'issue-error' : 'issue-warning'}>
                  {issue.message}
                </li>
              ))}
            </ul>
          )}

          <section className="panel">
            <div className="mode-switch operating-schedules" role="group" aria-label="Schedule">
              <button
                type="button"
                className={office === MAIN ? 'active' : ''}
                onClick={() => dispatch(scheduleChosen(MAIN))}
              >
                Main schedule
              </button>
              {offices.map(each => (
                <button
                  key={each}
                  type="button"
                  className={office === each ? 'active' : ''}
                  onClick={() => dispatch(scheduleChosen(each))}
                >
                  Office: {each}
                </button>
              ))}
            </div>
            <form
              className="operating-add"
              onSubmit={e => {
                e.preventDefault();
                dispatch(addOffice(newOffice, true));
                setNewOffice('');
              }}
            >
              <input
                type="text"
                aria-label="Add an office"
                placeholder="Add an office (e.g. preClosing)"
                value={newOffice}
                onChange={e => setNewOffice(e.target.value)}
              />
              <button
                type="submit"
                className="secondary-button"
                disabled={!newOffice.trim() || offices.includes(newOffice.trim())}
              >
                Add office (copy of the main schedule)
              </button>
            </form>
            <p className="field-hint">
              An office is another schedule a flow can ask for (its “office” in Check operating hours), e.g. the main
              hours ending 15 minutes early. For a channel it doesn’t have, the main schedule is used.
            </p>

            {schedule && (
              <>
                <div className="operating-timezone">
                  <span className="field-label">Time zone</span>
                  <TimeZonePicker
                    value={schedule.timezone}
                    onChange={zone => dispatch(setTimezone(zone))}
                    label={`Time zone of ${office === MAIN ? 'the main schedule' : office}`}
                  />
                  {nowIn(schedule.timezone) && <span className="muted">Now there: {nowIn(schedule.timezone)}</span>}
                  {office !== MAIN && (
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => {
                        if (window.confirm(`Remove the office “${office}”?`)) dispatch(removeOffice(office));
                      }}
                    >
                      Remove this office
                    </button>
                  )}
                </div>

                <h3>Hours</h3>
                {channels.length > 0 ? (
                  <>
                    <div className="mode-switch" role="group" aria-label="Channel">
                      {channels.map(each => (
                        <button
                          key={each}
                          type="button"
                          className={each === channel ? 'active' : ''}
                          onClick={() => dispatch(channelChosen(each))}
                        >
                          {each}
                        </button>
                      ))}
                    </div>
                    {channel && <ChannelHours schedule={schedule} channel={channel} />}
                  </>
                ) : (
                  <p className="muted">
                    {office === MAIN
                      ? 'No channels yet: every check fails until there’s one.'
                      : 'No channels of its own: the main schedule’s hours are used.'}
                  </p>
                )}
                <AddChannel channels={channels} />
              </>
            )}
          </section>

          {schedule && <Holidays schedule={schedule} />}
          <CheckATime channels={allChannels} offices={offices} />
        </>
      )}
    </div>
  );
};
