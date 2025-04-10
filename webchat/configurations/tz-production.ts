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
import { config as tzStaging } from '../configurations/tz-staging';

const accountSid = 'AC24b2e69a74f051b368f4ec17f51ddbbc';
const flexFlowSid = 'FO84244cfcfb1f02bd6790b29c72421449';

export const config: Configuration = {
  ...tzStaging,
  accountSid,
  flexFlowSid,
};
