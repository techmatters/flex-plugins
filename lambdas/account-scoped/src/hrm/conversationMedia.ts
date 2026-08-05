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

import type { AccountSID, CallSid } from '@tech-matters/twilio-types';
import { HrmContact } from '@tech-matters/hrm-types';
import { isOk, Result } from '../Result';
import { getExternalRecordingS3Location } from '../conversation/getExternalRecordingS3Location';
import { getDocsBucketName } from '@tech-matters/twilio-configuration';
import { postToInternalHrmEndpoint } from './internalHrmRequest';
import { HrmAccountId } from './hrmAccountId';

export type S3Location = {
  bucket: string;
  key: string;
};

export type TwilioStoredMedia = {
  storeType: 'twilio';
  storeTypeSpecificData: {
    reservationSid: string;
  };
};

export type S3StoredMedia = {
  storeType: 'S3';
  storeTypeSpecificData: {
    type: 'transcript' | 'recording';
    location?: S3Location;
  };
};

export type ConversationMedia = TwilioStoredMedia | S3StoredMedia;

export const newTwilioStoredMedia = (reservationSid: string): TwilioStoredMedia => ({
  storeType: 'twilio',
  storeTypeSpecificData: {
    reservationSid,
  },
});

export const newPendingS3StoredTranscript = (): S3StoredMedia => ({
  storeType: 'S3',
  storeTypeSpecificData: {
    type: 'transcript',
    location: undefined,
  },
});

export const newS3StoredRecording = (location: S3Location): S3StoredMedia => ({
  storeType: 'S3',
  storeTypeSpecificData: {
    type: 'recording',
    location,
  },
});

/**
 * Looks up the S3 location the external recording for a call will be written to and returns a
 * conversation media item pointing at it, or undefined if no recording could be located.
 */
export const newS3StoredRecordingForCall = async ({
  accountSid,
  callSid,
}: {
  accountSid: AccountSID;
  callSid: CallSid | string;
}): Promise<S3StoredMedia | undefined> => {
  const recordingResult = await getExternalRecordingS3Location({ accountSid, callSid });
  if (!isOk(recordingResult)) {
    console.warn(
      `[${accountSid}] Could not find an external recording location for call ${callSid}, no recording conversation media will be added`,
      recordingResult.message,
    );
    return undefined;
  }
  const { bucket, key } = recordingResult.data;
  return newS3StoredRecording({ bucket, key });
};

/**
 * Returns the recording conversation media for a voice task, using the recording location already
 * attached to the task attributes if there is one, otherwise looking it up from the call.
 */
export const newS3StoredRecordingForVoiceTask = async ({
  accountSid,
  taskAttributes,
}: {
  accountSid: AccountSID;
  taskAttributes: {
    conference?: { participants?: { worker?: CallSid } };
    conversations?: { segment_link?: string };
  };
}): Promise<S3StoredMedia | undefined> => {
  const { conference, conversations } = taskAttributes;
  const segmentLink = conversations?.segment_link;
  if (segmentLink) {
    // The recording location is already added to the task, no need to look it up
    const { pathname } = new URL(segmentLink);
    return newS3StoredRecording({
      bucket: await getDocsBucketName(accountSid),
      key: pathname.startsWith('/') ? pathname.substring(1) : pathname,
    });
  }
  const callSid = conference?.participants?.worker;
  if (!callSid) {
    console.warn(
      `[${accountSid}] Could not find a call sid for the worker in the conference attached to the task, no recording conversation media will be added`,
    );
    return undefined;
  }
  return newS3StoredRecordingForCall({ accountSid, callSid });
};

export const saveConversationMedia = async ({
  hrmAccountId,
  hrmApiVersion,
  contactId,
  conversationMedia,
}: {
  hrmAccountId: HrmAccountId;
  hrmApiVersion: string;
  contactId: string | number;
  conversationMedia: ConversationMedia[];
}): Promise<Result<Error, HrmContact> | undefined> => {
  if (!conversationMedia.length) {
    console.debug(
      `[${hrmAccountId}] No conversation media to add to contact ${contactId}, skipping`,
    );
    return undefined;
  }
  const conversationMediaResult = await postToInternalHrmEndpoint<
    ConversationMedia[],
    HrmContact
  >(
    hrmAccountId,
    hrmApiVersion,
    `contacts/${contactId}/conversationMedia`,
    conversationMedia,
  );
  if (isOk(conversationMediaResult)) {
    console.info(
      `[${hrmAccountId}] Added ${conversationMedia.length} conversation media item(s) to contact ${contactId}`,
    );
  } else {
    console.error(
      `[${hrmAccountId}] Failed to add conversation media to contact ${contactId}`,
      conversationMediaResult.message,
      conversationMediaResult.error,
    );
  }
  return conversationMediaResult;
};
