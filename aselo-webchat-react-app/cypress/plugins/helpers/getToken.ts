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

import { jwt } from "twilio";

import { getWorker } from "./getWorker";
import { parseRegionForTwilioClient } from "../../../shared/regionUtil";

const getJwt = (identity: string, grants: any[], { ttl }: { ttl?: number } = {}) => {
    const { AccessToken } = jwt;
    const token = new AccessToken(process.env.ACCOUNT_SID!, process.env.API_KEY!, process.env.API_SECRET!, {
        identity,
        region: parseRegionForTwilioClient(process.env.REACT_APP_REGION),
        ttl: ttl || 60 * 5
    });

    grants.forEach((g) => token.addGrant(g));

    return token.toJwt();
};

const getToken = async () => {
    const worker = await getWorker();
    const attributes = JSON.parse(worker.attributes);
    const identity = attributes.contact_uri.replace(/client:/, "");
    const { AccessToken } = jwt;

    const grant = new AccessToken.TaskRouterGrant({
        workspaceSid: worker.workspaceSid,
        workerSid: worker.sid,
        role: "worker"
    });
    return getJwt(identity, [grant]);
};

export { getToken };
