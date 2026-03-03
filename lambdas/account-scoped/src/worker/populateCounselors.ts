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

import { AccountSID } from '@tech-matters/twilio-types';
import { getTwilioClient, getWorkspaceSid } from '@tech-matters/twilio-configuration';
import { FlexValidatedHandler } from '../validation/flexToken';
import { newErr, newOk } from '../Result';

export const populateCounselorsHandler: FlexValidatedHandler = async (
  { body: event },
  accountSid: AccountSID,
) => {
  const { helpline } = event as { helpline?: string };

  try {
    const client = await getTwilioClient(accountSid);
    const workspaceSid = await getWorkspaceSid(accountSid);

    const workers = await client.taskrouter.v1.workspaces(workspaceSid).workers.list();

    const withHelpline = workers.map(w => {
      const attributes = JSON.parse(w.attributes);
      return {
        sid: w.sid,
        fullName: attributes.full_name as string,
        helpline: attributes.helpline as string,
      };
    });

    if (helpline) {
      const filtered = withHelpline.filter(
        w => w.helpline === helpline || w.helpline === '' || w.helpline === undefined,
      );
      const workerSummaries = filtered.map(({ fullName, sid }) => ({ fullName, sid }));
      return newOk({ workerSummaries });
    }

    const workerSummaries = withHelpline.map(({ fullName, sid }) => ({ fullName, sid }));
    return newOk({ workerSummaries });
  } catch (err: any) {
    return newErr({ message: err.message, error: { statusCode: 500, cause: err } });
  }
};
