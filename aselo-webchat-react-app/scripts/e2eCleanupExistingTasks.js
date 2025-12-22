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

const params = process.argv.slice(2);
const Twilio = require("twilio");

const getParams = () => {
    const { accountSid, authToken } = params.reduce((acc, arg) => {
        const [, key, val] = arg.match(/(\w*)=(\S*)/) || [];

        if (key) {
            acc[key] = val;
        }

        return acc;
    }, {});

    return { accountSid, authToken };
};

const cleanupTasks = async () => {
    const { accountSid, authToken } = getParams();
    console.log("getting client");
    const client = new Twilio(accountSid, authToken);

    console.log("getting workspace");
    const [{ sid: workspaceSid }] = await client.taskrouter.v1.workspaces.list();

    console.log("getting tasks");
    const tasks = await client.taskrouter.v1.workspaces(workspaceSid).tasks.list();

    console.log("proceeding to remove older tasks: ", tasks.length);
    await Promise.all(tasks.map((t) => {
        console.log("deleting task: ", t.sid);
        return t.remove()
    }));
    console.log("done");
};

cleanupTasks();
