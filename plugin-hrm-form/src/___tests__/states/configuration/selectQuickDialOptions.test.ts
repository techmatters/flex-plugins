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

import { RootState } from '../../../states';
import { namespace } from '../../../states/storeNamespaces';
import { RecursivePartial } from '../../RecursivePartial';
import { selectQuickDialOptions } from '../../../states/configuration/selectQuickDialOptions';

describe('selectQuickDialOptions', () => {
  test('returns quick dial options from state when present', () => {
    const quickDialOptions = [{ labelKey: 'foo', phoneNumber: '+123' }];
    const partialState: RecursivePartial<RootState> = {
      [namespace]: {
        configuration: {
          aseloTwilioConfiguration: { quickDialOptions },
        },
      },
    };

    expect(selectQuickDialOptions(partialState as RootState)).toStrictEqual(quickDialOptions);
  });

  test('returns empty array when quick dial options are missing', () => {
    const partialState: RecursivePartial<RootState> = {
      [namespace]: {
        configuration: {
          aseloTwilioConfiguration: {},
        },
      },
    };

    expect(selectQuickDialOptions(partialState as RootState)).toStrictEqual([]);
  });
});
