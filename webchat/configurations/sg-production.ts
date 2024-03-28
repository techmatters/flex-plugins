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
import { config as sgStaging } from '../configurations/sg-staging';

const accountSid = 'AC0751f021d17d50f0ee5af094acdee7c8';
const flexFlowSid = 'FO1f6ef1622a491dd6e8a51daba2f79bb3';

export const config: Configuration = {
  ...sgStaging,
  accountSid,
  flexFlowSid,
};
