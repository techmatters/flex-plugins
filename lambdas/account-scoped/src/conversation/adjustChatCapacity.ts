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

import '@twilio-labs/serverless-runtime-types';
import { WorkerChannelInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/worker/workerChannel';
import type { AccountSID, WorkerSID } from '@tech-matters/twilio-types';
import { getTwilioClient, getWorkspaceSid } from '@tech-matters/twilio-configuration';

export type AdjustChatCapacityParameters = {
  workerSid: WorkerSID;
  adjustment: 'increaseUntilCapacityAvailable' | 'setTo1';
};

const increaseChatCapacity = async (
  channel: WorkerChannelInstance,
  maxMessageCapacity: number,
) => {
  if (channel.availableCapacityPercentage > 0) {
    return {
      result: {
        status: 412,
        message: 'Still have available capacity, no need to increase.',
      },
      updatedChannel: channel,
    };
  }

  if (!(channel.configuredCapacity < maxMessageCapacity)) {
    return {
      result: { status: 412, message: 'Reached the max capacity.' },
      updatedChannel: channel,
    };
  }

  const updatedChannel = await channel.update({
    capacity: channel.configuredCapacity + 1,
  });
  return {
    result: { status: 200, message: 'Successfully increased channel capacity' },
    updatedChannel,
  };
};

export const adjustChatCapacity = async (
  accountSid: AccountSID,
  body: AdjustChatCapacityParameters,
): Promise<{ status: number; message: string }> => {
  const client = await getTwilioClient(accountSid);

  const worker = await client.taskrouter.v1.workspaces
    .get(await getWorkspaceSid(accountSid))
    .workers(body.workerSid)
    .fetch();

  if (!worker) return { status: 404, message: 'Could not find worker.' };

  const attributes = JSON.parse(worker.attributes);
  const maxMessageCapacity = parseInt(attributes.maxMessageCapacity, 10);

  if (!maxMessageCapacity) {
    return {
      status: 409,
      message: `Worker ${body.workerSid} does not have a "maxMessageCapacity" attribute, can't adjust capacity.`,
    };
  }

  const channels = await worker.workerChannels().list();
  let channel = channels.find(c => c.taskChannelUniqueName === 'chat');

  if (!channel) return { status: 404, message: 'Could not find chat channel.' };

  if (body.adjustment === 'increaseUntilCapacityAvailable') {
    let result: Awaited<ReturnType<typeof increaseChatCapacity>>['result'] = {
      status: 200,
      message: '',
    };
    while (result.status === 200) {
      // eslint-disable-next-line no-await-in-loop
      ({ result, updatedChannel: channel } = await increaseChatCapacity(
        channel,
        maxMessageCapacity,
      ));
    }
    if (
      channel.configuredCapacity === maxMessageCapacity &&
      channel.availableCapacityPercentage === 0
    ) {
      return {
        status: 412,
        message: 'Reached the max capacity with no available capacity.',
      };
    }
    return {
      status: 200,
      message: 'Adjusted chat capacity until there is capacity available',
    };
  }

  if (body.adjustment === 'setTo1') {
    if (channel.configuredCapacity !== 1) {
      await channel.update({ capacity: 1 });
      // If configuredCapacity is already 1, send status 200 to avoid error on client side
      return { status: 200, message: 'Successfully reset channel capacity to 1' };
    }

    // If configuredCapacity is already 1, send status 200 to avoid error on client side
    return { status: 200, message: 'Channel capacity already 1, no adjustment made.' };
  }

  return { status: 400, message: 'Invalid adjustment argument' };
};
