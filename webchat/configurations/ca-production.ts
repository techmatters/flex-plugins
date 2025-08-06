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
import { config as caStaging } from '../configurations/ca-staging';

const accountSid = 'AC9f951863c83dc61cf94bdc12a12270a5';
const flexFlowSid = 'FOa3e32f6b854254daf4b49c8ed3a04303';

export const config: Configuration = {
  ...caStaging,
  checkOpenHours: true,
  accountSid,
  flexFlowSid,
  twilioServicesUrl: new URL(`https://hrm-production-ca.tl.techmatters.org/lambda/twilio/account-scoped/${accountSid}`),
};
