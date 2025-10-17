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
import { config as etStaging } from '../configurations/et-staging';

const accountSid = 'AC16aa1fb9123860efd3bdde74de556e21';
const flexFlowSid = 'FOb18e8dca4c6322d2abe701d159ea77eb';

export const config: Configuration = {
  ...etStaging,
  accountSid,
  flexFlowSid,
  twilioServicesUrl: new URL(`https://hrm-production.tl.techmatters.org/lambda/twilio/account-scoped/${accountSid}`),
};
