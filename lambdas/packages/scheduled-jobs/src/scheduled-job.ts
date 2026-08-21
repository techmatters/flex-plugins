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

type CreateVoicemailSchedule = {
  jobType: 'create-voicemail-schedule';
  voicemailTask: {
    timeout: number;
    attributes: {
      routingAttributes: any;
      isVoicemail: true;
      callSid: string;
      from: string;
      name: string;
      channelType: 'voicemail';
      customChannelType: 'voicemail';
      ignoreAgent: '';
      transferTargetType: '';
    };
    workflowSid: string;
  };
};
export const isValidVoicemailTask = (
  task: any,
): task is CreateVoicemailSchedule['voicemailTask'] => {
  //TODO
  return true;
};

export type ScheduledJobType = CreateVoicemailSchedule;
