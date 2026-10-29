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
 * Recordings in the editor: the Recording section of a voice message's settings, script approval
 * for messaging, and the Recordings tab (every voice message on the board, uploads of many files
 * at once, and files no widget on the board uses).
 *
 * Anyone who can edit the board uploads (to staging); Aselo staff approve and publish.
 */
import { useRef, useState } from 'react';
import type { FlowObject, Frame } from './model';
import type { MessageStatus, Recording, RecordingsList } from './recordings';
import {
  hasNonStandardRecording,
  isApproved,
  isPublished,
  isVoiceMessage,
  MAX_RECORDING_BYTES,
  messageStatus,
  RECORDING_EXTENSIONS,
  recordingOf,
  standardRecordingName,
} from './recordings';

export type RecordingActions = {
  list?: RecordingsList;
  // Why recordings can't be shown (e.g. not set up yet)
  unavailable?: string;
  // Files being uploaded, approved or published right now
  busy: Set<string>;
  staff: boolean;
  readOnly: boolean;
  upload: (fileName: string, file: File) => Promise<void>;
  approve: (fileName: string, approved: boolean) => Promise<void>;
  publish: (fileName: string) => Promise<void>;
  remove: (fileName: string) => Promise<void>;
  // Aselo staff: give these objects' recordings their standard names (the widget's), copying the files
  rename?: (objectIds: string[]) => Promise<void>;
};

const ACCEPT = '.mp3,.wav,audio/mpeg,audio/wav';

const extensionOf = (file: File) => file.name.split('.').pop()?.toLowerCase() ?? '';

// Whether the file can be a recording; the problem in plain language if not
export const recordingFileProblem = (file: File) => {
  if (!(RECORDING_EXTENSIONS as readonly string[]).includes(extensionOf(file))) {
    return `${file.name} isn't an MP3 or WAV file.`;
  }
  if (file.size > MAX_RECORDING_BYTES) return `${file.name} is too big for a recording.`;
  return undefined;
};

export const StatusChip = ({ status }: { status: MessageStatus }) => (
  <span className={`flow-status flow-status-${status.toLowerCase().replace(/\s+/g, '-')}`}>{status}</span>
);

const when = (at?: string) => (at ? new Date(at).toLocaleString() : '');

// Approve and publish buttons, for Aselo staff
const StaffButtons = ({ recording, actions }: { recording: Recording; actions: RecordingActions }) => {
  if (!actions.staff || actions.readOnly || !recording.staging) return null;
  const busy = actions.busy.has(recording.fileName);
  const approved = isApproved(recording);
  return (
    <span className="flow-recording-buttons">
      {!isPublished(recording) && (
        <button
          type="button"
          className="secondary-button"
          disabled={busy}
          onClick={() => actions.approve(recording.fileName, !approved)}
        >
          {approved ? 'Withdraw approval' : 'Approve'}
        </button>
      )}
      {approved && !isPublished(recording) && (
        <button
          type="button"
          className="primary-button"
          disabled={busy}
          onClick={() => {
            // eslint-disable-next-line no-alert
            const sure = window.confirm(
              `Publish ${recording.fileName} to production? Callers will hear it on their next call.`,
            );
            if (sure) actions.publish(recording.fileName);
          }}
        >
          Publish to production
        </button>
      )}
    </span>
  );
};

const UploadButton = ({
  label,
  disabled,
  onFile,
}: {
  label: string;
  disabled: boolean;
  onFile: (file: File) => void;
}) => {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={input}
        type="file"
        accept={ACCEPT}
        hidden
        aria-label={label}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = '';
        }}
      />
      <button type="button" className="secondary-button" disabled={disabled} onClick={() => input.current?.click()}>
        {label}
      </button>
    </>
  );
};

/**
 * A voice message's recording: its status, players for staging and production, and what this
 * person can do next.
 */
export const RecordingSection = ({
  object,
  frame,
  actions,
}: {
  object: Pick<FlowObject, 'id' | 'type' | 'message' | 'studioName'>;
  frame?: Pick<Frame, 'channel'>;
  actions: RecordingActions;
}) => {
  const [problem, setProblem] = useState<string>();
  const [renaming, setRenaming] = useState(false);
  if (!isVoiceMessage(object, frame)) return null;
  const recording = recordingOf(object, actions.list?.recordings);
  const status = messageStatus(object, frame, actions.list?.recordings);
  const busy = recording ? actions.busy.has(recording.fileName) : false;

  const upload = (file: File) => {
    const found = recordingFileProblem(file);
    setProblem(found);
    if (!found && object.studioName) actions.upload(`${object.studioName}.${extensionOf(file)}`, file);
  };

  return (
    <section className="flow-inspector-section" aria-label="Recording">
      <h3>
        Recording <StatusChip status={status} />
      </h3>
      {actions.unavailable && <p className="field-hint">{actions.unavailable}</p>}
      {!actions.unavailable && !object.studioName && (
        <p className="field-hint">Give it a Studio name first: the recording file is named after it.</p>
      )}
      {!actions.unavailable && object.studioName && (
        <>
          <p className="field-hint">
            File: <code>{recording?.fileName ?? `${object.studioName}.mp3`}</code> (MP3 or WAV)
          </p>
          {hasNonStandardRecording(object) && (
            <div className="flow-recording-rename">
              <span className="field-hint">
                An older name: the standard is the widget&apos;s,{' '}
                <code>{standardRecordingName(object.studioName, object.message!.recordingFile!)}</code>.
              </span>
              {actions.staff && !actions.readOnly && actions.rename && (
                <button
                  type="button"
                  className="secondary-button"
                  disabled={renaming}
                  onClick={async () => {
                    setRenaming(true);
                    await actions.rename!([object.id]);
                    setRenaming(false);
                  }}
                >
                  {renaming ? 'Renaming…' : 'Use the standard name'}
                </button>
              )}
            </div>
          )}
          {recording?.staging && (
            <div className="flow-recording-player">
              <span className="field-hint">
                Staging · uploaded{recording.uploadedBy ? ` by ${recording.uploadedBy}` : ''}{' '}
                {when(recording.uploadedAt)}
              </span>
              <audio controls preload="none" src={recording.staging.url} aria-label="Staging recording" />
              {recording.approvedBy && (
                <span className="field-hint">
                  Approved by {recording.approvedBy} {when(recording.approvedAt)}
                </span>
              )}
            </div>
          )}
          {recording?.production && (
            <div className="flow-recording-player">
              <span className="field-hint">
                Production
                {isPublished(recording) ? '' : ' · an older version'}
                {recording.publishedBy ? ` · published by ${recording.publishedBy} ${when(recording.publishedAt)}` : ''}
              </span>
              {!isPublished(recording) && (
                <audio controls preload="none" src={recording.production.url} aria-label="Production recording" />
              )}
            </div>
          )}
          {problem && <div className="alert alert-error">{problem}</div>}
          {!actions.readOnly && (
            <div className="option-actions">
              <UploadButton
                label={recording?.staging ? 'Replace recording' : 'Upload recording'}
                disabled={busy}
                onFile={upload}
              />
              {recording && <StaffButtons recording={recording} actions={actions} />}
            </div>
          )}
          {busy && <p className="field-hint">Working…</p>}
        </>
      )}
    </section>
  );
};

/**
 * Messaging scripts are approved by Aselo staff, in place of a recording.
 */
export const ScriptApproval = ({
  object,
  frame,
  staff,
  readOnly,
  userName,
  onApprove,
}: {
  object: Pick<FlowObject, 'type' | 'message' | 'studioName'>;
  frame?: Pick<Frame, 'channel'>;
  staff: boolean;
  readOnly: boolean;
  userName: string;
  onApprove: (approved: NonNullable<FlowObject['message']>['approved']) => void;
}) => {
  if (isVoiceMessage(object, frame)) return null;
  const status = messageStatus(object, frame);
  const { approved } = object.message ?? {};
  return (
    <section className="flow-inspector-section" aria-label="Script approval">
      <h3>
        Script <StatusChip status={status} />
      </h3>
      {status === 'Approved' && approved && (
        <p className="field-hint">
          Approved by {approved.by} {when(approved.at)}
        </p>
      )}
      {status === 'Script ready' && <p className="field-hint">Waiting for the Aselo team to approve it.</p>}
      {staff && !readOnly && status !== 'No script' && (
        <button
          type="button"
          className="secondary-button"
          onClick={() =>
            onApprove(
              status === 'Approved'
                ? undefined
                : { by: userName, at: new Date().toISOString(), script: object.message?.script ?? '' },
            )
          }
        >
          {status === 'Approved' ? 'Withdraw approval' : 'Approve script'}
        </button>
      )}
    </section>
  );
};

// frame: the object's frame, or the board's own flow (what tells a voice message)
type BoardMessage = { object: FlowObject; frame?: Pick<Frame, 'channel'> };

/**
 * The Recordings tab: every voice message on the board with its recording, many files uploaded
 * at once (matched to widgets by file name), and the helpline's files no widget here uses.
 */
export const RecordingsPanel = ({
  messages,
  actions,
  onShow,
  onRefresh,
}: {
  messages: BoardMessage[];
  actions: RecordingActions;
  onShow: (objectId: string) => void;
  onRefresh: () => void;
}) => {
  const [report, setReport] = useState<string[]>([]);
  const [unmatched, setUnmatched] = useState<File[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const recordings = actions.list?.recordings ?? [];
  const voice = messages.filter(({ object, frame }) => isVoiceMessage(object, frame));
  const used = new Set(voice.map(({ object }) => recordingOf(object, recordings)?.fileName).filter(Boolean));
  const others = recordings.filter((recording) => !used.has(recording.fileName));
  const approvedWaiting = recordings.filter((recording) => isApproved(recording) && !isPublished(recording));
  // Voice messages whose recording has an older name, not the widget's
  const oldNames = voice.filter(({ object }) => hasNonStandardRecording(object));
  const [renaming, setRenaming] = useState(false);

  const uploadMany = async (files: File[]) => {
    const lines: string[] = [];
    const leftOver: File[] = [];
    for (const file of files) {
      const problem = recordingFileProblem(file);
      if (problem) {
        lines.push(problem);
        continue;
      }
      const base = file.name.replace(/\.[^.]+$/, '');
      const match = voice.find(({ object }) => object.studioName === base);
      if (!match) {
        leftOver.push(file);
        continue;
      }
      await actions.upload(`${base}.${extensionOf(file)}`, file);
      lines.push(`${file.name} uploaded.`);
    }
    setReport(lines);
    setUnmatched(leftOver);
  };

  if (actions.unavailable) {
    return (
      <div className="flow-recordings" role="region" aria-label="Recordings">
        <p className="field-hint">{actions.unavailable}</p>
      </div>
    );
  }

  return (
    <div className="flow-recordings" role="region" aria-label="Recordings">
      <p className="field-hint">
        Each voice message plays the file named after its Studio name. Uploads go to staging (test calls hear them);
        Aselo staff approve and publish them to production.
      </p>
      <div className="option-actions">
        <button type="button" className="secondary-button" onClick={onRefresh}>
          Refresh
        </button>
        {!actions.readOnly && (
          <>
            <input
              ref={input}
              type="file"
              accept={ACCEPT}
              multiple
              hidden
              aria-label="Upload several recordings"
              onChange={(e) => {
                const files = [...(e.target.files ?? [])];
                e.target.value = '';
                if (files.length > 0) uploadMany(files);
              }}
            />
            <button type="button" className="secondary-button" onClick={() => input.current?.click()}>
              Upload several…
            </button>
          </>
        )}
      </div>
      {actions.staff && !actions.readOnly && actions.rename && oldNames.length > 0 && (
        <div className="flow-recording-rename">
          <span className="field-hint">
            {oldNames.length} recording{oldNames.length === 1 ? ' has' : 's have'} an older name, not the widget&apos;s.
            Renaming copies each file under the standard name (live flows keep playing the old one until the template
            changes).
          </span>
          <button
            type="button"
            className="secondary-button"
            disabled={renaming}
            onClick={async () => {
              setRenaming(true);
              await actions.rename!(oldNames.map(({ object }) => object.id));
              setRenaming(false);
            }}
          >
            {renaming ? 'Renaming…' : `Use the standard names (${oldNames.length})`}
          </button>
        </div>
      )}
      {actions.staff && !actions.readOnly && approvedWaiting.length > 0 && (
        <button
          type="button"
          className="primary-button flow-publish-all"
          onClick={async () => {
            // eslint-disable-next-line no-alert
            const sure = window.confirm(
              `Publish ${approvedWaiting.length} approved recording${approvedWaiting.length === 1 ? '' : 's'} to production? Callers will hear them on their next call.`,
            );
            if (!sure) return;
            for (const recording of approvedWaiting) await actions.publish(recording.fileName);
          }}
        >
          Publish all approved ({approvedWaiting.length})
        </button>
      )}
      {report.length > 0 && (
        <ul className="flow-upload-report">
          {report.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}
      {unmatched.length > 0 && (
        <div className="alert alert-info">
          No widget on this board is named after these (the file name, without .mp3 or .wav, has to be the Studio name):
          <ul>
            {unmatched.map((file) => (
              <li key={file.name}>{file.name}</li>
            ))}
          </ul>
          <button
            type="button"
            className="link-button"
            onClick={async () => {
              const files = unmatched;
              setUnmatched([]);
              for (const file of files) await actions.upload(file.name, file);
            }}
          >
            Upload them anyway (for another board)
          </button>
        </div>
      )}

      <h3>On this board</h3>
      {voice.length === 0 && <p className="field-hint">No voice messages yet.</p>}
      <ul className="flow-recording-list">
        {voice.map(({ object, frame }) => {
          const recording = recordingOf(object, recordings);
          return (
            <li key={object.id}>
              <button type="button" className="link-button flow-task-title" onClick={() => onShow(object.id)}>
                {object.studioName ?? object.text}
              </button>
              <StatusChip status={messageStatus(object, frame, recordings)} />
              {recording?.staging && (
                <audio
                  controls
                  preload="none"
                  src={recording.staging.url}
                  aria-label={`${recording.fileName} (staging)`}
                />
              )}
              {recording && <StaffButtons recording={recording} actions={actions} />}
            </li>
          );
        })}
      </ul>

      {others.length > 0 && (
        <>
          <h3>Not used on this board</h3>
          <p className="field-hint">
            Recordings of this helpline that no widget here is named after: another board, or a typo.
          </p>
          <ul className="flow-recording-list">
            {others.map((recording) => (
              <li key={recording.fileName}>
                <code>{recording.fileName}</code>
                <span className="field-hint">
                  {isPublished(recording)
                    ? 'Published'
                    : recording.production
                      ? 'In production (older)'
                      : 'Staging only'}
                </span>
                {recording.staging && (
                  <audio
                    controls
                    preload="none"
                    src={recording.staging.url}
                    aria-label={`${recording.fileName} (staging)`}
                  />
                )}
                {!actions.readOnly && recording.staging && !recording.production && (
                  <button
                    type="button"
                    className="link-button danger"
                    onClick={() => {
                      // eslint-disable-next-line no-alert
                      if (window.confirm(`Remove ${recording.fileName} from staging?`))
                        actions.remove(recording.fileName);
                    }}
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};
