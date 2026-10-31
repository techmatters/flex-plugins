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
 * The Test panel: runs a flow (simulate.ts) from its trigger, asking for what a person sends or
 * presses and what a lambda answers, and lists each step. A finished run can be marked as tested;
 * tested paths show green on the board while nothing on them changes, with what's left to test.
 */
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCheck, CircleAlert, Play, RotateCcw, Square, Trash2, Undo2, X } from 'lucide-react';
import type { BoardContent, FlowObject, TestedPath } from './model';
import { messageFor, OBJECT_TYPES } from './model';
import type { Recording } from './recordings';
import { recordingOf } from './recordings';
import { answer, coverageOf, SimAnswer, SimRun, startRun, widgetNameOf } from './simulate';

type Props = {
  content: BoardContent;
  run?: SimRun;
  // The next state of the run (Back returns to this one), a new run (fresh: nothing to go back to), or
  // the same one changed (replace: e.g. pausing turned off)
  onRun: (run?: SimRun, how?: 'fresh' | 'replace') => void;
  // Back to the run before the last answer (e.g. to take another way at a split)
  onBack?: () => void;
  // The texts and recordings shown (flows sharing a template: the variant shown on the board)
  variant?: string;
  mainVariant?: string;
  recordings?: Recording[];
  // Still valid tested paths (nothing on them changed)
  testedPaths: TestedPath[];
  showTested: boolean;
  onShowTested: (show: boolean) => void;
  // Not given when the board can't be changed (view only)
  onMarkTested?: () => void;
  onForget?: (pathId?: string) => void;
  onEndHere?: (objectId: string, exit: string) => void;
  onShow: (objectId: string) => void;
};

const DIALPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
// A question's or menu's ways out that are what was sent or pressed (the others are buttons)
const ANSWERED = new Set(['reply', 'incomingMessage', 'keypress', 'speech']);

const labelOf = (object?: FlowObject) => (object ? object.text.trim() || OBJECT_TYPES[object.type].label : 'Gone');

export const SimulatorPanel = ({
  content,
  run,
  onRun,
  onBack,
  variant,
  mainVariant,
  recordings,
  testedPaths,
  showTested,
  onShowTested,
  onMarkTested,
  onForget,
  onEndHere,
  onShow,
}: Props) => {
  const byId = new Map(content.objects.map((object) => [object.id, object]));
  // Where a run can start: each trigger, named after its frame
  const starts = content.objects
    .filter((object) => object.type === 'incoming')
    .map((object) => {
      const frame = content.frames.find((candidate) => candidate.id === object.frameId);
      return {
        id: object.id,
        label: frame ? `${frame.title}${frame.channel ? ` (${frame.channel})` : ''}` : labelOf(object),
      };
    });
  const [startId, setStartId] = useState(starts[0]?.id);
  const start = starts.find((candidate) => candidate.id === startId)?.id ?? starts[0]?.id;

  const [text, setText] = useState('');
  const [digits, setDigits] = useState('');
  const [memory, setMemory] = useState<{ key: string; value: string }[]>([{ key: '', value: '' }]);
  // Stopping at every widget, to check its script or recording before going on
  const [pauseEach, setPauseEach] = useState(true);
  const transcript = useRef<HTMLOListElement>(null);
  useEffect(() => {
    transcript.current?.lastElementChild?.scrollIntoView?.({ block: 'nearest' });
  }, [run?.steps.length]);

  const reply = (given: SimAnswer) => {
    if (!run) return;
    setText('');
    setDigits('');
    onRun(answer(content, run, given));
  };
  const play = () => {
    if (!start) return;
    setMemory([{ key: '', value: '' }]);
    onRun(startRun(content, start, pauseEach), 'fresh');
  };
  const changePause = (pause: boolean) => {
    setPauseEach(pause);
    if (run) onRun({ ...run, pauseEach: pause || undefined }, 'replace');
  };

  const { prompt, ended } = run ?? {};
  const asked = prompt && byId.get(prompt.objectId);
  // What the widget says or plays, to check it
  const message = asked && OBJECT_TYPES[asked.type].hasMessage ? messageFor(asked, variant, mainVariant) : undefined;
  const recording = asked && message ? recordingOf({ ...asked, message }, recordings) : undefined;
  const otherExits = prompt && 'exits' in prompt ? prompt.exits.filter((exit) => exit && !ANSWERED.has(exit)) : [];
  const coverage = coverageOf(content, testedPaths);
  const untested = coverage.waysOut.filter((way) => !way.tested);
  const flowMemory = run?.attributes.flowMemory;

  return (
    <div className="flow-simulator">
      <section className="flow-sim-start">
        {starts.length === 0 ? (
          <p className="field-hint">Add an Incoming call / message to start a run from.</p>
        ) : (
          <>
            {starts.length > 1 && (
              <label className="field">
                <span className="field-label">Start from</span>
                <select value={start} onChange={(e) => setStartId(e.target.value)}>
                  {starts.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <span className="flow-sim-controls">
              <button type="button" className="primary-button" onClick={play}>
                {run ? <RotateCcw size={15} aria-hidden /> : <Play size={15} aria-hidden />}{' '}
                {run ? 'Run again' : 'Play'}
              </button>
              {run && onBack && (
                <button
                  type="button"
                  className="secondary-button"
                  title="Back one step, e.g. to take another way at a split"
                  onClick={onBack}
                >
                  <Undo2 size={14} aria-hidden /> Back
                </button>
              )}
              {run && !ended && (
                <button type="button" className="secondary-button" onClick={() => reply({ kind: 'stop' })}>
                  <Square size={14} aria-hidden /> Stop
                </button>
              )}
              {run && (
                <button type="button" className="link-button" onClick={() => onRun(undefined, 'fresh')}>
                  Clear
                </button>
              )}
            </span>
            <label className="field-checkbox">
              <input type="checkbox" checked={pauseEach} onChange={(e) => changePause(e.target.checked)} />
              <span>Pause at every widget (to check its script or recording)</span>
            </label>
          </>
        )}
      </section>

      {run && (
        <ol className="flow-sim-steps" ref={transcript} aria-label="Steps">
          {run.steps.map((step, index) => {
            const object = byId.get(step.objectId);
            const newExecution = index > 0 && step.execution !== run.steps[index - 1].execution;
            return (
              <li key={index} className={index === run.steps.length - 1 && run.current ? 'current' : ''}>
                {newExecution && <span className="flow-sim-execution">Execution {step.execution}</span>}
                <button type="button" className="flow-sim-step" onClick={() => onShow(step.objectId)}>
                  <span className="flow-sim-step-number">{index + 1}</span>
                  <span className="flow-sim-step-body">
                    <span className="flow-sim-step-name">{labelOf(object)}</span>
                    {object && object.type !== 'incoming' && <code>{widgetNameOf(object)}</code>}
                    {step.note && <span className="flow-sim-note">{step.note}</span>}
                  </span>
                  {step.exit && <span className="flow-sim-exit">{step.exit}</span>}
                </button>
              </li>
            );
          })}
        </ol>
      )}

      {/* What the run is waiting for */}
      {prompt && asked && (
        <section className="flow-sim-prompt" aria-label="What happens next">
          <h3>{labelOf(asked)}</h3>
          {asked.type !== 'incoming' && <code className="flow-sim-widget">{widgetNameOf(asked)}</code>}
          {message && (
            <div className="flow-sim-message">
              {message.script ? (
                <blockquote>{message.script}</blockquote>
              ) : (
                <p className="field-hint">No script yet.</p>
              )}
              {recording?.staging ? (
                <audio controls preload="none" src={recording.staging.url} aria-label="Recording" />
              ) : (
                message.recordingFile && (
                  <p className="field-hint">Plays {message.recordingFile} (not uploaded here).</p>
                )
              )}
            </div>
          )}
          {prompt.kind === 'continue' && (
            <>
              {prompt.note && <p className="field-hint">{prompt.note}</p>}
              <span className="flow-sim-choices">
                <button type="button" className="primary-button" autoFocus onClick={() => reply({ kind: 'continue' })}>
                  Next{prompt.exit ? `: ${prompt.exit}` : ''} <ArrowRight size={14} aria-hidden />
                </button>
              </span>
            </>
          )}
          {prompt.kind === 'reply' && (
            <form
              className="flow-sim-chat"
              onSubmit={(e) => {
                e.preventDefault();
                reply({ kind: 'reply', text });
              }}
            >
              <input
                autoFocus
                value={text}
                placeholder="Their reply"
                aria-label="Their reply"
                onChange={(e) => setText(e.target.value)}
              />
              <button type="submit" className="primary-button">
                Send
              </button>
            </form>
          )}
          {prompt.kind === 'dialpad' && (
            <>
              <div className="flow-sim-dialpad" role="group" aria-label="Dialpad">
                {DIALPAD.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      // One key is the answer (Studio's default); more end with #
                      if (prompt.digits <= 1 && key !== '#') reply({ kind: 'digits', digits: key });
                      else if (key === '#' || digits.length + 1 >= prompt.digits) {
                        reply({ kind: 'digits', digits: key === '#' ? digits : digits + key });
                      } else setDigits(digits + key);
                    }}
                  >
                    {key}
                  </button>
                ))}
              </div>
              {digits && <p className="field-hint">Pressed {digits}… (# to finish)</p>}
              <form
                className="flow-sim-chat"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (text.trim()) reply({ kind: 'speech', text });
                }}
              >
                <input
                  value={text}
                  placeholder="Or what they say"
                  aria-label="What they say"
                  onChange={(e) => setText(e.target.value)}
                />
                <button type="submit" className="secondary-button">
                  Say
                </button>
              </form>
            </>
          )}
          {prompt.kind === 'choose' && <p className="field-hint">{prompt.why}</p>}
          {prompt.kind === 'release' && (
            <>
              <p className="field-hint">
                The chatbot has the conversation. What does it keep in <code>{prompt.memoryAttribute}</code>? (Optional;
                the next execution can split on it.)
              </p>
              {memory.map((row, index) => (
                <span key={index} className="flow-variable-row">
                  <input
                    value={row.key}
                    placeholder="age"
                    aria-label="Memory key"
                    onChange={(e) =>
                      setMemory(memory.map((other, i) => (i === index ? { ...other, key: e.target.value } : other)))
                    }
                  />
                  <input
                    value={row.value}
                    placeholder="15"
                    aria-label="Memory value"
                    onChange={(e) =>
                      setMemory(memory.map((other, i) => (i === index ? { ...other, value: e.target.value } : other)))
                    }
                  />
                </span>
              ))}
              <button
                type="button"
                className="link-button"
                onClick={() => setMemory([...memory, { key: '', value: '' }])}
              >
                + Another
              </button>
              <span className="flow-sim-choices">
                <button
                  type="button"
                  className="primary-button"
                  onClick={() =>
                    reply({
                      kind: 'release',
                      memory: Object.fromEntries(
                        memory.filter(({ key }) => key.trim()).map(({ key, value }) => [key.trim(), value]),
                      ),
                    })
                  }
                >
                  {prompt.triggersFlow ? `Hand back: execution ${run!.execution + 1}` : 'Bot finishes'}
                </button>
              </span>
            </>
          )}
          {(prompt.kind === 'choose' ? prompt.exits : otherExits).length > 0 && (
            <span className="flow-sim-choices">
              {(prompt.kind === 'choose' ? prompt.exits : otherExits).map((exit) => (
                <button
                  key={exit}
                  type="button"
                  className="secondary-button"
                  title={exit}
                  onClick={() => reply({ kind: 'exit', exit })}
                >
                  {exit}
                </button>
              ))}
            </span>
          )}
        </section>
      )}

      {ended && (
        <section className={`flow-sim-end ${ended.kind}`} role="status">
          {ended.kind === 'end' ? <CheckCheck size={16} aria-hidden /> : <CircleAlert size={16} aria-hidden />}
          <span>{ended.message}</span>
          {ended.kind === 'deadEnd' && ended.objectId && ended.exit !== undefined && onEndHere && (
            <button type="button" className="link-button" onClick={() => onEndHere(ended.objectId!, ended.exit!)}>
              It ends here on purpose
            </button>
          )}
          {ended.kind === 'end' && onMarkTested && (
            <button type="button" className="primary-button" onClick={onMarkTested}>
              Mark path as tested
            </button>
          )}
          <span className="flow-sim-choices">
            <button type="button" className="secondary-button" onClick={play}>
              <RotateCcw size={14} aria-hidden /> Test another path
            </button>
            {onBack && (
              <button type="button" className="link-button" onClick={onBack}>
                Back one step
              </button>
            )}
          </span>
        </section>
      )}

      {run && (
        <details className="flow-sim-state">
          <summary>What the run knows</summary>
          <dl>
            <dt>Flow variables</dt>
            <dd>
              <code>{JSON.stringify(run.variables)}</code>
            </dd>
            <dt>Flow memory (kept)</dt>
            <dd>
              <code>{JSON.stringify(flowMemory ?? {})}</code>
            </dd>
            <dt>Conversation attributes</dt>
            <dd>
              <code>{JSON.stringify(run.attributes)}</code>
            </dd>
          </dl>
        </details>
      )}

      <section className="flow-sim-coverage">
        <h3>Tested</h3>
        <label className="field-checkbox">
          <input type="checkbox" checked={showTested} onChange={(e) => onShowTested(e.target.checked)} />
          <span>Show tested paths (green)</span>
        </label>
        <p className="field-hint">
          {coverage.waysOut.length - untested.length} of {coverage.waysOut.length} ways out tested, in{' '}
          {testedPaths.length} path{testedPaths.length === 1 ? '' : 's'}. A path stops counting when something on it
          changes.
        </p>
        {untested.length > 0 && (
          <details>
            <summary>Not tested yet ({untested.length})</summary>
            <ul className="flow-sim-untested">
              {untested.map((way) => (
                <li key={`${way.objectId}|${way.exit}`}>
                  <button type="button" className="link-button" onClick={() => onShow(way.objectId)}>
                    {labelOf(byId.get(way.objectId))}
                    {way.exit ? `: ${way.exit}` : ''}
                  </button>
                </li>
              ))}
            </ul>
          </details>
        )}
        {testedPaths.length > 0 && (
          <ul className="flow-sim-paths">
            {testedPaths.map((path) => (
              <li key={path.id}>
                <span>
                  {path.steps.length} steps, by {path.testedBy}, {new Date(path.testedAt).toLocaleString()}
                </span>
                {onForget && (
                  <button
                    type="button"
                    className="icon-button"
                    aria-label="Forget this tested path"
                    title="Forget this tested path"
                    onClick={() => onForget(path.id)}
                  >
                    <X size={14} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        {testedPaths.length > 0 && onForget && (
          <button type="button" className="link-button" onClick={() => onForget()}>
            <Trash2 size={13} aria-hidden /> Forget all tested paths
          </button>
        )}
      </section>
    </div>
  );
};
