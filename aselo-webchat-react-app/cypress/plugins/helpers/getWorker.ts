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

import { WorkerInstance } from "twilio/lib/rest/taskrouter/v1/workspace/worker";
import { ActivityInstance } from "twilio/lib/rest/taskrouter/v1/workspace/activity";

import { getTwilioClient } from "./twilioClient";

let worker: WorkerInstance;
let workerActivities: ActivityInstance[];
const CHAT_CHANNEL_CAPACITY = 10;
const taskByConversationSidCache = new Map();
export const getWorker = async () => {
    if (worker) {
        return worker;
    }
    const client = getTwilioClient();

    const [workspace] = await client.taskrouter.workspaces.list({ limit: 1 });

    [worker] = await client.taskrouter.workspaces(workspace.sid).workers.list({ limit: 1 });

    const channels = await worker.workerChannels().list();

    if (channels && channels.length > 0) {
        for (const c of channels) {
            if (c.taskChannelUniqueName === "chat" && c.configuredCapacity !== CHAT_CHANNEL_CAPACITY) {
                // increase the capacity of the chat channel to 10
                await client.taskrouter
                    .workspaces(workspace.sid)
                    .workers(worker.sid)
                    .workerChannels(c.sid)
                    .update({ capacity: CHAT_CHANNEL_CAPACITY });
            }
        }
    }

    return worker;
};

const getWorkerActivities = async () => {
    if (!worker) {
        await getWorker();
    }
    if (workerActivities) {
        return workerActivities;
    }
    const client = getTwilioClient();

    workerActivities = await client.taskrouter.workspaces(worker.workspaceSid).activities.list();

    return workerActivities;
};

export const setWorkerOnline = async () => {
    if (!worker) {
        await getWorker();
    }
    workerActivities = await getWorkerActivities();

    const onlineActivitySid = workerActivities.find((a) => a.available)?.sid;

    if (worker.activitySid === onlineActivitySid) {
        return;
    }
    try {
        await worker.update({ activitySid: onlineActivitySid });
    } catch (e) {
        console.log(e);
    }
};

export const getTaskAndReservationFromConversationSid = async (
    conversationSid: string,
    { fetchReservation } = { fetchReservation: false }
) => {
    let { task, reservation } = taskByConversationSidCache.get(conversationSid) || {};

    if (!task) {
        if (!worker) {
            await getWorker();
        }
        console.log(`getting task for conversation ${conversationSid}`);
        const client = getTwilioClient();

        [task] = await client.taskrouter
            .workspaces(worker.workspaceSid)
            .tasks.list({ evaluateTaskAttributes: `conversationSid == "${conversationSid}"` });

        if (!task) {
            throw Error(`Couldn't find a task with conversationSid === ${conversationSid}`);
        }

        console.log(`got task ${task.sid}`);

        taskByConversationSidCache.set(conversationSid, { task });
    }

    if (fetchReservation && !reservation) {
        const reservations = await task.reservations().list({ reservationStatus: "pending" });

        reservation = reservations.find((r) => r.workerSid === worker.sid);

        if (!reservation) {
            throw Error(`Couldn't find a pending reservation for task ${task.sid} for worker ${worker.sid}`);
        }

        console.log(`got reservation ${reservation.sid}`);

        taskByConversationSidCache.set(conversationSid, { task, reservation });
    }

    return { task, reservation };
};
