/** @jest-environment ./jest/jsdomEnvironment.cjs */
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
import { afterEach, beforeAll, describe, expect, test } from '@jest/globals';
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { DefinitionFiles, loadDefinitionFiles } from '@tech-matters/form-builder-server/definitionsApi';
import type { ApiUser } from '@tech-matters/form-builder-shared';

import { aseloStaff, createHarness, formDefinitionsDir, helplinesConfigDir } from '../testing/workspaceHarness';

const usnmStaff: ApiUser = { name: 'NAMI person', role: 'helpline-staff', helplines: ['usnm'] };
const FILE = 'account-scoped/operatingInfo.json';

let usnm: DefinitionFiles;
let usvc: DefinitionFiles;
beforeAll(async () => {
  usnm = await loadDefinitionFiles(formDefinitionsDir, 'usnm', 'v1', helplinesConfigDir);
  usvc = await loadDefinitionFiles(formDefinitionsDir, 'usvc', 'v1', helplinesConfigDir);
});
afterEach(cleanup);

const openOperatingHours = async (definitions: DefinitionFiles) => {
  const harness = createHarness();
  harness.renderWorkspace(definitions, { user: aseloStaff });
  await waitFor(() => expect(screen.queryByText('Loading the draft…')).toBeNull());
  fireEvent.click(screen.getByRole('button', { name: 'Operating hours' }));
  return harness;
};

describe('operating hours', () => {
  test('helpline staff see them, can’t change them, and can comment on them', async () => {
    const harness = createHarness();
    harness.renderWorkspace(usnm, { user: usnmStaff });
    await waitFor(() => expect(screen.queryByText('Loading the draft…')).toBeNull());
    fireEvent.click(screen.getByRole('button', { name: 'Operating hours' }));
    expect(screen.getByText(/The Aselo team sets these/)).toBeTruthy();
    // Readable, not changeable
    const monday = screen.getByRole('rowheader', { name: 'Monday' }).closest('tr')!;
    expect(within(monday).getByLabelText('Monday opens').matches(':disabled')).toBe(true);
    // (hidden on the page; disabled either way)
    expect(screen.getAllByRole('button', { name: 'Add hours' }).every(button => button.matches(':disabled'))).toBe(
      true,
    );
    expect(screen.queryByRole('textbox', { name: 'Add an office' })).toBeNull();
    // The other channels and offices can still be looked at
    fireEvent.click(screen.getByRole('button', { name: 'voice' }));
    fireEvent.click(screen.getByRole('button', { name: 'Office: preClosing' }));
    expect(screen.getByRole('rowheader', { name: 'Monday' })).toBeTruthy();
    // A question for the Aselo team
    const review = screen.getByRole('region', { name: 'Review: operating hours' });
    fireEvent.click(within(review).getByRole('button', { name: '+ Flag or comment' }));
    fireEvent.change(within(review).getByRole('textbox', { name: 'New comment' }), {
      target: { value: 'Can we close at 21:00 on Fridays?' },
    });
    fireEvent.click(within(review).getByRole('button', { name: /Send|Add|Post|Flag/ }));
    await within(review).findByText('Can we close at 21:00 on Fridays?');
    const draft = await harness.store.get('usnm', 'v1');
    expect(draft?.meta.threads?.[0]).toMatchObject({
      target: 'section:operatingHours',
      text: 'Can we close at 21:00 on Fridays?',
    });
  });

  test('changing a day’s hours, and checking a time', async () => {
    const harness = await openOperatingHours(usnm);
    expect((screen.getByRole('combobox', { name: 'Time zone of the main schedule' }) as HTMLInputElement).value).toBe(
      'America/New_York',
    );
    // Its flows ask for sms and voice, with the preClosing office: nothing to fix
    await waitFor(() => expect(screen.queryByRole('list', { name: 'Problems' })).toBeNull());

    // Saturday was closed for sms
    const saturday = screen.getByRole('rowheader', { name: 'Saturday' }).closest('tr')!;
    expect(within(saturday).getByText('Closed')).toBeTruthy();
    fireEvent.click(within(saturday).getByRole('button', { name: 'Add hours' }));
    fireEvent.change(within(saturday).getByLabelText('Saturday closes'), { target: { value: '14:00' } });
    await screen.findByText(/All changes saved/);
    const saved = await harness.savedFile(usnm, FILE);
    expect(saved.operatingHours.sms['6']).toEqual([{ open: 900, close: 1400 }]);
    // voice and the office as they were
    expect(saved.operatingHours.voice['6']).toEqual([]);
    expect(saved.offices.preClosing.operatingHours.sms['6']).toEqual([]);

    // Check a time: Saturday 2026-11-07 at noon
    fireEvent.change(screen.getByLabelText('Date to check'), { target: { value: '2026-11-07' } });
    fireEvent.change(screen.getByLabelText('Time to check'), { target: { value: '12:00' } });
    expect(screen.getByRole('status').textContent).toBe('Open, from the main schedule.');
    fireEvent.change(screen.getByLabelText('Date to check'), { target: { value: '2026-11-26' } });
    expect(screen.getByRole('status').textContent).toBe('Holiday (Thanksgiving Day): closed. From the main schedule.');
  });

  test('an overnight shift is split across midnight', async () => {
    const harness = await openOperatingHours(usnm);
    const friday = screen.getByRole('rowheader', { name: 'Friday' }).closest('tr')!;
    fireEvent.change(within(friday).getByLabelText('Friday closes'), { target: { value: '02:00' } });
    expect(within(friday).getByText(/Goes past midnight/)).toBeTruthy();
    expect(screen.getByRole('list', { name: 'Problems' }).textContent).toMatch(/goes past midnight/);
    fireEvent.click(within(friday).getByRole('button', { name: 'Split across midnight' }));
    await screen.findByText(/All changes saved/);
    const saved = await harness.savedFile(usnm, FILE);
    expect(saved.operatingHours.sms['5']).toEqual([{ open: 1000, close: 2400 }]);
    expect(saved.operatingHours.sms['6']).toEqual([{ open: 0, close: 200 }]);
  });

  test('holidays: one added by hand, and the past ones removed', async () => {
    const harness = await openOperatingHours(usnm);
    const holidays = screen.getByRole('region', { name: 'Holidays' });
    fireEvent.change(within(holidays).getByLabelText('Holiday date'), { target: { value: '2026-12-31' } });
    fireEvent.change(within(holidays).getByLabelText('Holiday name'), { target: { value: 'New Year’s Eve' } });
    fireEvent.click(within(holidays).getByRole('button', { name: 'Add holiday' }));
    await screen.findByText(/All changes saved/);
    expect((await harness.savedFile(usnm, FILE)).holidays['12/31/2026']).toBe('New Year’s Eve');
  });

  test('a new office starts as a copy of the main schedule', async () => {
    const harness = await openOperatingHours(usnm);
    fireEvent.change(screen.getByRole('textbox', { name: 'Add an office' }), { target: { value: 'weekend' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add office (copy of the main schedule)' }));
    expect(screen.getByRole('button', { name: 'Office: weekend' })).toBeTruthy();
    await screen.findByText(/All changes saved/);
    const saved = await harness.savedFile(usnm, FILE);
    expect(saved.offices.weekend.operatingHours).toEqual(saved.operatingHours);
  });

  test('a helpline without them sets them up with a time zone', async () => {
    const harness = await openOperatingHours(usvc);
    expect(screen.getByText(/This helpline has no operating hours/)).toBeTruthy();
    fireEvent.change(screen.getByRole('combobox', { name: 'Time zone' }), { target: { value: 'America/Chicago' } });
    fireEvent.click(screen.getByRole('button', { name: 'Set up operating hours' }));
    await screen.findByText(/All changes saved/);
    expect((await harness.savedFile(usvc, FILE)).timezone).toBe('America/Chicago');
  });
});
