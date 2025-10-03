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
import { config as mtStaging } from '../configurations/mt-staging';

const accountSid = 'AC7854f6126459347434a8e659295ebb79';
const flexFlowSid = 'FO46d948dc907e2e5d36b07a63bd1f0052';

export const config: Configuration = {
  ...mtStaging,
  accountSid,
  flexFlowSid,
  twilioServicesUrl: new URL(`https://hrm-production-eu.tl.techmatters.org/lambda/twilio/account-scoped/${accountSid}`),
};
