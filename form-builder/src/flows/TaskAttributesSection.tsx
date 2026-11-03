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
import { JsonTextarea } from './JsonTextarea';
import {
  channelAttributesJson,
  channelTemplateOf,
  standardTaskAttributes,
  usesChannelAttributes,
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
  // The channel's template the widget can use (unknown for widgets imported with attributes of their own)
  const channelTemplate = channelTemplateOf(attributes);
  const usesChannel = usesChannelAttributes(attributes);
  const changed = !channelTemplate && attributes.imported !== undefined && attributes.json !== attributes.imported;
  const otherChannels = attributes.otherChannels?.flatMap((other) => other.channels) ?? [];
  return (
    <section className="flow-inspector-section" aria-label="Task attributes">
      <h3>Task attributes</h3>
      <p className="field-hint">
        What the task carries to routing and to Flex. <code>{'{{…}}'}</code> is filled in from the contact when it
        arrives; <code>{'${helpline}'}</code> and <code>{'${task_language}'}</code> are the helpline&apos;s settings.
      </p>
      {channelTemplate && (
        <label className="field-checkbox">
          <input
            type="checkbox"
            checked={usesChannel}
            disabled={readOnly}
            onChange={(event) =>
              onChange(
                event.target.checked
                  ? {
                      ...attributes,
                      json: channelAttributesJson(attributes) ?? attributes.json,
                      source: { kind: 'channelAttributes', ...channelTemplate },
                    }
                  : { ...attributes, source: { kind: 'inline', movedFrom: channelTemplate } },
              )
            }
          />
          <span>Use the channel&apos;s task attributes</span>
        </label>
      )}
      <p className="field-hint">
        {usesChannel && channelTemplate ? (
          <>
            From <code>{channelTemplate.template}</code>
            {channelTemplate.channels.length > 0 && <> for {channelTemplate.channels.join(', ')}</>} (the widget says{' '}
            <code>{'${channel_attributes.default}'}</code>), the same for every Send to queue in the flow that uses
            them. To give this one different attributes (another queue, language or service), untick it.
          </>
        ) : (
          <>
            This widget&apos;s own: its task gets exactly these, written in the widget.
            {channelTemplate && <> The channel&apos;s template stays as it is.</>}
            {otherChannels.length > 0 && (
              <> The other channels sharing this flow ({otherChannels.join(', ')}) get them too.</>
            )}
          </>
        )}
      </p>
      <JsonTextarea
        className="flow-task-attributes"
        value={attributes.json}
        rows={Math.min(18, Math.max(6, attributes.json.split('\n').length + 1))}
        spellCheck={false}
        aria-label="Task attributes JSON"
        disabled={readOnly || usesChannel}
        isValid={(json) => !taskAttributesProblem(json)}
        onValueChange={(json) => onChange({ ...attributes, json })}
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
