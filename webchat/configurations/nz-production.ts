/**
 * Copyright (C) 2021-2023 Technology Matters
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

import { Configuration } from '../types';
import { config as nzStaging } from './nz-staging';

const accountSid = 'AC2825ea172ea83c2e422a9772a27beb29';
const flexFlowSid = 'FOa14530d4cb09277f40c266a0ae0cffb1';

export const config: Configuration = {
  ...nzStaging,
  checkOpenHours: true,
  accountSid,
  flexFlowSid,
};
