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

import { Twilio } from "twilio";

import { parseRegionForTwilioClient } from "../../../shared/regionUtil";

let twilioClient: Twilio;

export const getTwilioClient = () => {
    if (twilioClient) {
        return twilioClient;
    }

    twilioClient = new Twilio(process.env.ACCOUNT_SID!, process.env.AUTH_TOKEN!, {
        region: parseRegionForTwilioClient(process.env.REACT_APP_REGION)
    });
    return twilioClient;
};
