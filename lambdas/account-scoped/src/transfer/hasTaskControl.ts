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
import { Twilio } from 'twilio';

// TODO: unify with Flex
export type TransferMeta = {
  mode: 'COLD' | 'WARM';
  transferStatus: 'transferring' | 'accepted' | 'rejected';
  sidWithTaskControl: string;
};

export type ChatTransferTaskAttributes = {
  transferMeta?: TransferMeta;
  transferTargetType?: 'worker' | 'queue';
};

const hasTransferStarted = (taskAttributes: ChatTransferTaskAttributes) =>
  Boolean(taskAttributes && taskAttributes.transferMeta);

export const hasTaskControl = async ({
  client,
  workspaceSid,
  taskSid,
}: {
  client: Twilio;
  workspaceSid: string;
  taskSid: string;
}) => {
  const task = await client.taskrouter.v1.workspaces(workspaceSid).tasks(taskSid).fetch();
  const taskAttributes = JSON.parse(task.attributes);
  if (!hasTransferStarted(taskAttributes)) {
    console.debug('hasTaskControl? Yes - Transfer has not started');
    return true;
  }
  const reservations = await client.taskrouter.v1.workspaces
    .get(workspaceSid)
    .tasks.get(taskSid)
    .reservations.list();
  const res = Boolean(
    reservations.find(r => r.sid === taskAttributes.transferMeta?.sidWithTaskControl),
  );
  console.debug(
    `hasTaskControl? ${res ? 'Yes' : 'No'} - ${
      taskAttributes.transferMeta?.sidWithTaskControl
    } (taskAttributes.transferMeta?.sidWithTaskControl) IN (${reservations.map(r => r.sid)})`,
  );
  return res;
};
