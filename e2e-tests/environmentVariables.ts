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

import { config } from 'dotenv';
config();

const environmentVariables = {
  PLAYWRIGHT_USER_USERNAME: process.env.PLAYWRIGHT_USER_USERNAME,
  PLAYWRIGHT_USER_PASSWORD: process.env.PLAYWRIGHT_USER_PASSWORD,
  PLAYWRIGHT_BASEURL: process.env.PLAYWRIGHT_BASEURL,
  PLAYWRIGHT_BROWSER_TELEMETRY_LEVEL: process.env.PLAYWRIGHT_BROWSER_TELEMETRY_LEVEL,
  PLAYWRIGHT_BROWSER_TELEMETRY_LOG_RESPONSE_BODY:
    process.env.PLAYWRIGHT_BROWSER_TELEMETRY_LOG_RESPONSE_BODY,
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  DEBUG: process.env.DEBUG,
};

export default environmentVariables;
