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

/**
 * Recordings and message statuses (docs/flow-designer.md, "Recordings and scripts"). Shared by
 * the API and the page, so no browser or server code here.
 *
 * A voice message's recording is the file named after its Studio name
 * (play_message_voice_en_welcome.mp3). Helpline staff upload to the helpline's staging folder;
 * Aselo staff approve it and publish it to the production folder, which is what production
 * Studio flows play.
 */
import type { FlowObject, Frame } from './model';
import { OBJECT_TYPES } from './model';

export type RecordingEnvironment = 'staging' | 'production';

export const RECORDING_EXTENSIONS = ['mp3', 'wav'] as const;
export const RECORDING_CONTENT_TYPES: Record<(typeof RECORDING_EXTENSIONS)[number], string> = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
};
// Twilio plays files up to a few minutes long; this is far beyond any prompt
export const MAX_RECORDING_BYTES = 20 * 1024 * 1024;

// A Studio name and an extension: play_message_voice_en_welcome.mp3
export const RECORDING_FILE_PATTERN = /^[A-Za-z0-9_]+\.(mp3|wav)$/;

export type StoredRecording = {
  // Changes whenever the file does (S3's ETag)
  etag: string;
  size: number;
  lastModified: string;
  // Where it can be played from
  url: string;
};

export type Recording = {
  fileName: string;
  staging?: StoredRecording;
  production?: StoredRecording;
  uploadedBy?: string;
  uploadedAt?: string;
  // Set when the current staging file was approved; uploading a new one clears it
  approvedBy?: string;
  approvedAt?: string;
  publishedBy?: string;
  publishedAt?: string;
  // Where it was copied from, when the helpline was imported
  importedFrom?: Partial<Record<RecordingEnvironment, string>>;
};

export type RecordingsList = {
  // Where each environment's folder is; the Studio flows' recordings URL variable
  baseUrls: Record<RecordingEnvironment, string>;
  recordings: Recording[];
};

// The staging file is the one approved, and production has it too
export const isApproved = (recording: Recording) => Boolean(recording.approvedBy && recording.staging);
export const isPublished = (recording: Recording) =>
  Boolean(recording.staging && recording.production && recording.staging.etag === recording.production.etag);

export const isVoiceMessage = (object: Pick<FlowObject, 'type' | 'message'>, frame?: Pick<Frame, 'channel'>) =>
  Boolean(OBJECT_TYPES[object.type].hasMessage) && (object.message?.channel ?? frame?.channel) === 'voice';

// The object's recording: a file named after its Studio name, MP3 or WAV
export const recordingOf = (object: Pick<FlowObject, 'studioName' | 'message'>, recordings: Recording[] = []) => {
  // Imported from a helpline whose files aren't named after their widgets
  const own = object.message?.recordingFile;
  if (own) return recordings.find((recording) => recording.fileName === own);
  return object.studioName
    ? recordings.find((recording) =>
        RECORDING_EXTENSIONS.some((extension) => recording.fileName === `${object.studioName}.${extension}`),
      )
    : undefined;
};

export type MessageStatus = 'No script' | 'Script ready' | 'Recorded' | 'Approved' | 'Published';

/**
 * Where a message is: voice goes No script → Script ready → Recorded → Approved → Published;
 * messaging goes No script → Script ready → Approved (the script, by Aselo staff).
 */
export const messageStatus = (
  object: Pick<FlowObject, 'type' | 'message' | 'studioName'>,
  frame?: Pick<Frame, 'channel'>,
  recordings?: Recording[],
): MessageStatus => {
  const script = object.message?.script?.trim();
  if (isVoiceMessage(object, frame)) {
    const recording = recordingOf(object, recordings);
    if (recording && isPublished(recording)) return 'Published';
    if (recording && isApproved(recording)) return 'Approved';
    if (recording?.staging) return 'Recorded';
    return script ? 'Script ready' : 'No script';
  }
  if (!script) return 'No script';
  return object.message?.approved && object.message.approved.script === object.message.script
    ? 'Approved'
    : 'Script ready';
};
