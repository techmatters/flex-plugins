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
import { config as asStaging } from '../configurations/as-staging';

const accountSid = 'AC4858840776b1f98a1367c9c6a401bd2c';
const flexFlowSid = 'FO84c7ba10d1a11ade93c787c91faeaa74';
const enableRecaptcha = true;

export const config: Configuration = {
  ...asStaging,
  accountSid,
  flexFlowSid,
  enableRecaptcha,
  twilioServicesUrl: new URL(`https://hrm-production.tl.techmatters.org/lambda/twilio/account-scoped/${accountSid}`),
};
