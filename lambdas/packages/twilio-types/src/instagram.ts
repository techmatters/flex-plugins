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

export type InstagramMessageObject = {
  sender: {
    id: string;
  };
  recipient: {
    id: string;
  };
  timestamp: number; // message timestamp
  message: {
    mid: string;
    text?: string; // the body of the message
    attachments?: { type: string; payload: { url: string } }[];
    is_deleted?: boolean;
  };
};

export type InstagramStoryReply = InstagramMessageObject['message'] & {
  reply_to: {
    story: { url: string; id: string };
  };
};

export type InstagramMessageEntry = {
  time: number; // event timestamp
  id: string; // IGSID of the subscribed Instagram account
  messaging: [InstagramMessageObject];
};

/** Object describing a single entry and a single message.
 * We sanitize the payload in the central webhook.
 *  If we start seeing batched events this shape will not be a singleton but an array
 */
export type InstagramMessageEvent = {
  object: 'instagram';
  entry: [InstagramMessageEntry];
  testSessionId?: string; // Only used in Aselo integration tests, not sent from instagram
};
