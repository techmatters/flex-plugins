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
import { config as coStaging } from '../configurations/co-staging';

const accountSid = 'AC520ec62dcfa4ab4105c2f5850caf52b0';
const flexFlowSid = 'FOf1ace264485595c61b9d926657c105c0';

export const config: Configuration = {
  ...coStaging,
  checkOpenHours: true,
  accountSid,
  flexFlowSid,
  twilioServicesUrl: new URL(`https://hrm-production.tl.techmatters.org/lambda/twilio/account-scoped/${accountSid}`),
};
