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

import { ITask } from '@twilio/flex-ui';

const defaultsNNS = {
  sid: 'sid',
  taskSid: 'taskSid',
  queueName: 'queueName',
  queueSid: 'queueSid',
  taskChannelSid: 'taskChannelSid',
  taskChannelUniqueName: 'taskChannelUniqueName',
  workflowName: 'workflowName',
  workflowSid: 'workflowSid',
  workerSid: 'workerSid',
  channelType: 'channelType',
};

/**
 * // override of ITask so we can preserve the return types of the methods (ITask returns any)
 * @returns {{
 *  source: any;
 *  sourceObject: any;
 *  addOns: object;
 *  age: number;
 *  attributes: any;
 *  dateCreated: Date;
 *  dateUpdated: Date;
 *  priority: number;
 *  queueName: string;
 *  queueSid: string;
 *  reason: string;
 *  sid: string;
 *  status: TaskReservationStatus;
 *  taskSid: string;
 *  taskStatus: TaskTaskStatus;
 *  taskChannelSid: string;
 *  taskChannelUniqueName: string;
 *  timeout: number;
 *  workflowName: string;
 *  workflowSid: string;
 *  workerSid: string;
 *  incomingTransferObject: any;
 *  outgoingTransferObject: any;
 *  routingTarget: string;
 *  defaultFrom: string;
 *  channelType: string;
 *  conference: any;
 *  accept: () => Promise<ReturnType<createTask>>
 *  complete: () => Promise<ReturnType<createTask>>
 *  transfer: () => Promise<ReturnType<createTask>>
 *  hold: () => Promise<ReturnType<createTask>>
 *  unhold: () => Promise<ReturnType<createTask>>
 *  holdParticipant: () => Promise<ReturnType<createTask>>
 *  unholdParticipant: () => Promise<ReturnType<createTask>>
 *  cancelTransfer: () => Promise<ReturnType<createTask>>
 *  kick: () => Promise<ReturnType<createTask>>
 *  setAttributes: (newAttributes: any) => Promise<ReturnType<createTask>>
 *  wrapUp: () => Promise<ReturnType<createTask>>
 * }}
 */
export function createTask(attributes = {}, namesNsids = {}): ITask {
  const {
    sid,
    taskSid,
    queueName,
    queueSid,
    taskChannelSid,
    taskChannelUniqueName,
    workflowName,
    workflowSid,
    workerSid,
    channelType,
  } = { ...defaultsNNS, ...namesNsids };

  return {
    attributes,
    formattedAttributes: null,
    source: null,
    sourceObject: null,
    addOns: null,
    age: 0,
    dateCreated: new Date(),
    dateUpdated: new Date(),
    priority: 0,
    reason: null,
    status: 'pending',
    taskStatus: 'reserved',
    timeout: 0,
    incomingTransferObject: null,
    outgoingTransferObject: null,
    routingTarget: null,
    defaultFrom: '',
    conference: null,
    queueName,
    queueSid,
    sid,
    taskSid,
    taskChannelSid,
    taskChannelUniqueName,
    workflowName,
    workflowSid,
    workerSid,
    channelType,
    complete() {
      return Promise.resolve({ ...this, dateUpdated: new Date(), status: 'completed', taskStatus: 'completed' });
    },
    transfer() {
      return Promise.resolve(this);
    },
    hold() {
      return Promise.resolve(this);
    },
    unhold() {
      return Promise.resolve(this);
    },
    holdParticipant() {
      return Promise.resolve(this);
    },
    unholdParticipant() {
      return Promise.resolve(this);
    },
    cancelTransfer() {
      return Promise.resolve(this);
    },
    kick() {
      return Promise.resolve(this);
    },
    endConference() {
      return Promise.resolve(this);
    },
    async addVoiceParticipant() {
      return this;
    },
    async updateWorkerParticipant() {
      return this;
    },
    async updateCustomerParticipant() {
      return this;
    },
    async issueCallToWorker() {
      return this;
    },
    async setEndConferenceOnExit() {
      return this;
    },
    async dequeue() {
      return this;
    },
    async getParticipants() {
      return null;
    },
    async redirectCall() {
      return null;
    },
    async getChannels() {
      return null;
    },
    async joinCall() {
      return null;
    },
    setAttributes(newAttributes) {
      this.attributes = newAttributes;
      return Promise.resolve(this);
    },
    wrapUp() {
      return Promise.resolve({ ...this, dateUpdated: new Date(), status: 'wrapping', taskStatus: 'wrapping' });
    },
  };
}

export async function acceptTask(task: ITask): Promise<ITask> {
  return { ...task, dateUpdated: new Date(), status: 'accepted', taskStatus: 'assigned' };
}
