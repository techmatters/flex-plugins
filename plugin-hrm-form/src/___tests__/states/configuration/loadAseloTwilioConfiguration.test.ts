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

import '../../mockFlexUi';
import '../../mockGetConfig';
import { initialState, reduce } from '../../../states/configuration/reducer';
import { newLoadAseloTwilioConfigurationAsyncAction } from '../../../states/configuration/loadAseloTwilioConfiguration';

describe('loadAseloTwilioConfigurationReducer', () => {
  test('stores fetched twilio configuration on fulfilled action', () => {
    const payload = {
      quickDialOptions: [{ labelKey: 'label', phoneNumber: '+123' }],
    };

    const result = reduce(initialState, newLoadAseloTwilioConfigurationAsyncAction.fulfilled(payload));

    expect(result.aseloTwilioConfiguration).toStrictEqual(payload);
  });

  test('keeps current state on rejected action', () => {
    const state = {
      ...initialState,
      aseloTwilioConfiguration: {
        quickDialOptions: [{ labelKey: 'existing', phoneNumber: '+456' }],
      },
    };
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

    const result = reduce(state, newLoadAseloTwilioConfigurationAsyncAction.rejected(new Error('Failed to load')));

    expect(result).toStrictEqual(state);
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });
});
