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
 * A "Send to queue" object's task attributes, in its settings: the JSON the task gets (what routing
 * rules read), where twilio-iac keeps it, and the other channels' when the flow is shared.
 */
import type { Channel, TaskAttributes } from './model';
import {
  standardTaskAttributes,
  standardTemplateFor,
  taskAttributeNames,
  taskAttributesProblem,
} from './taskAttributes';

// The attributes the routing rules usually read
const ROUTING_ATTRIBUTES = new Set(['channelType', 'helpline', 'language', 'transferTargetType', 'ignoreAgent']);

export const TaskAttributesSection = ({
  attributes,
  channel,
  readOnly,
  onChange,
}: {
  attributes?: TaskAttributes;
  // The frame's channel, for the standard attributes
  channel?: Channel;
  readOnly: boolean;
  onChange: (attributes: TaskAttributes | undefined) => void;
}) => {
  if (!attributes) {
    return (
      <section className="flow-inspector-section" aria-label="Task attributes">
        <h3>Task attributes</h3>
        <p className="field-hint">What the task carries to routing and to Flex (channel, helpline, language…).</p>
        {!readOnly && (
          <button type="button" className="secondary-button" onClick={() => onChange(standardTaskAttributes(channel))}>
            Use the standard ones ({standardTemplateFor(channel).split('/').pop()})
          </button>
        )}
      </section>
    );
  }
  const problem = taskAttributesProblem(attributes.json);
  const names = taskAttributeNames(attributes.json);
  const changed = attributes.imported !== undefined && attributes.json !== attributes.imported;
  const { source } = attributes;
  return (
    <section className="flow-inspector-section" aria-label="Task attributes">
      <h3>Task attributes</h3>
      <p className="field-hint">
        What the task carries to routing and to Flex. <code>{'{{…}}'}</code> is filled in from the contact when it
        arrives; <code>{'${helpline}'}</code> and <code>{'${task_language}'}</code> are the helpline&apos;s settings.
      </p>
      <p className="field-hint">
        {source.kind === 'channelAttributes' ? (
          <>
            Kept in <code>{source.template}</code>
            {source.channels.length > 0 && <> for {source.channels.join(', ')}</>} (the widget says{' '}
            <code>{'${channel_attributes.default}'}</code>).
            {source.template.startsWith('templates/') &&
              " Shared with other helplines: a change gets a template of this helpline's own."}
          </>
        ) : (
          'Written in the widget itself.'
        )}
      </p>
      <textarea
        className="flow-task-attributes"
        value={attributes.json}
        rows={Math.min(18, Math.max(6, attributes.json.split('\n').length + 1))}
        spellCheck={false}
        aria-label="Task attributes JSON"
        disabled={readOnly}
        onChange={(e) => onChange({ ...attributes, json: e.target.value })}
      />
      {problem ? (
        <p className="field-hint flow-task-attributes-problem">Not valid JSON: {problem}</p>
      ) : (
        <p className="flow-task-attribute-names">
          {names.map((name) => (
            <span
              key={name}
              className={`flow-task-attribute ${ROUTING_ATTRIBUTES.has(name) ? 'routing' : ''}`}
              title={ROUTING_ATTRIBUTES.has(name) ? 'Routing rules usually read this one' : undefined}
            >
              {name}
            </span>
          ))}
        </p>
      )}
      {changed && !readOnly && (
        <p className="field-hint">
          Changed on the board.{' '}
          <button
            type="button"
            className="link-button"
            onClick={() => onChange({ ...attributes, json: attributes.imported! })}
          >
            Undo the changes
          </button>
        </p>
      )}
      {attributes.otherChannels?.map((other) => (
        <details key={other.template} className="flow-task-attributes-other">
          <summary>
            {other.channels.join(', ')} get <code>{other.template}</code>
          </summary>
          <pre>{other.json}</pre>
        </details>
      ))}
    </section>
  );
};
