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
 * The task attributes a "Send to queue" widget (send-to-flex) gives the task: what TaskRouter's
 * rules read (channelType, helpline, language...) and what Flex shows.
 *
 * In twilio-iac the widget almost always says `${channel_attributes.default}`, and Terraform puts
 * there the channel's channel-attributes template (helplines/templates/channel-attributes/*.tftpl
 * or the helpline's own), chosen by `channel_attributes` in common.hcl (or defaults.hcl):
 *
 *   lookup(channel_attributes, conversations ? "<channel>-conversations" : "<channel>",
 *          channel_attributes[conversations ? "default-conversations" : "default"])
 *
 * and rendered with ${helpline} and ${task_language}. The designer shows the JSON itself.
 */
import type { Channel, TaskAttributes } from './model';

// The reference in a send-to-flex widget: "${channel_attributes.default}", or channel_attributes["default"]
// in templates written with jsonencode (read as { expression })
export const CHANNEL_ATTRIBUTES_REFERENCE = '${channel_attributes.default}';

export const isChannelAttributesReference = (value: unknown): boolean => {
  const text =
    typeof value === 'string'
      ? value
      : value && typeof value === 'object' && typeof (value as { expression?: unknown }).expression === 'string'
        ? `\${${(value as { expression: string }).expression}}`
        : undefined;
  return Boolean(text && /^\$\{\s*channel_attributes(?:\.default|\[\s*"default"\s*\])\s*\}$/.test(text.trim()));
};

// The template key Terraform looks up for a channel, and the one it falls back to
export const channelAttributesKeys = (channelName: string, conversations: boolean) =>
  conversations
    ? { key: `${channelName}-conversations`, fallback: 'default-conversations' }
    : { key: channelName, fallback: 'default' };

// The standard templates (helplines/templates/channel-attributes), as a starting point for a new
// "Send to queue"; a test keeps them the same as the files
export const STANDARD_TASK_ATTRIBUTES: Record<string, string> = {
  'templates/channel-attributes/voice.tftpl': `{
  "type": "inbound",
  "name": "{{trigger.call.From}}",
  "ignoreAgent": "",
  "helpline":"\${helpline}",
  "transferTargetType": "",
  "channelType": "voice",
  "conversations": {
    "hang_up_by": "Customer"
  }
}`,
  'templates/channel-attributes/chat-conversations.tftpl': `{
  "e2eTestMode": "{{trigger.conversation.ChannelAttributes.pre_engagement_data.e2eTestMode}}",
  "name": "{{trigger.conversation.ChannelAttributes.from}}",
  "ip": "{{trigger.conversation.ChannelAttributes.pre_engagement_data.ip}}",
  "firstName": "{{trigger.conversation.ChannelAttributes.from}}",
  "channelType": "{{trigger.conversation.ChannelAttributes.channel_type}}",
  "channelSid": "{{trigger.conversation.ChannelSid}}",
  "helpline": "{{trigger.conversation.ChannelAttributes.pre_engagement_data.helpline}}",
  "language":"\${task_language}",
  "ignoreAgent": "",
  "transferTargetType": "",
  "preEngagementData": {{trigger.conversation.ChannelAttributes.pre_engagement_data | to_json}},
  "memory": {{trigger.conversation.ChannelAttributes.memory | to_json}}
}`,
  'templates/channel-attributes/custom-channel-conversations.tftpl': `{
  "name": "{{trigger.conversation.ChannelAttributes.from}}",
  "channelType": "{{trigger.conversation.ChannelAttributes.channelType}}",
  "customChannelType": "{{trigger.conversation.ChannelAttributes.channelType}}",${' '}
  "channelSid": "{{trigger.conversation.ChannelSid}}",
  "twilioNumber": "{{trigger.conversation.ChannelAttributes.twilioNumber}}",
  "ignoreAgent": "",
  "helpline":"\${helpline}",
  "language":"\${task_language}",
  "transferTargetType": "",
  "memory": {{trigger.conversation.ChannelAttributes.memory | to_json}}
}`,
  'templates/channel-attributes/default-conversations.tftpl': `{
  "name": "{{trigger.conversation.ChannelAttributes.from}}",
  "channelType": "{% if trigger.conversation.ChannelAttributes.channel_type %}{{trigger.conversation.ChannelAttributes.channel_type}}{% else %}{{trigger.conversation.Source | downcase}}{% endif %}",
  "customChannelType": "{{trigger.conversation.ChannelAttributes.channelType}}",${' '}
  "channelSid": "{{trigger.conversation.ChannelSid}}",
  "twilioNumber": "{{trigger.conversation.ChannelAttributes.twilioNumber}}",
  "ignoreAgent": "",
  "helpline":"\${helpline}",
  "language":"\${task_language}",
  "transferTargetType": "",
  "memory": {{trigger.conversation.ChannelAttributes.memory | to_json}}
}`,
};

// The standard template for a channel (Conversations, as new helplines are set up)
export const standardTemplateFor = (channel: Channel | undefined) => {
  if (channel === 'voice') return 'templates/channel-attributes/voice.tftpl';
  if (channel === 'webchat') return 'templates/channel-attributes/chat-conversations.tftpl';
  if (channel === 'instagram' || channel === 'telegram' || channel === 'line') {
    return 'templates/channel-attributes/custom-channel-conversations.tftpl';
  }
  return 'templates/channel-attributes/default-conversations.tftpl';
};

export const standardTaskAttributes = (channel: Channel | undefined): TaskAttributes => {
  const template = standardTemplateFor(channel);
  return {
    json: STANDARD_TASK_ATTRIBUTES[template],
    source: { kind: 'channelAttributes', template, channels: [] },
  };
};

/**
 * Whether the attributes are JSON once Studio has filled in {{…}} / {%…%} (Liquid) and Terraform
 * ${…}: undefined when they are, otherwise the problem.
 */
// Liquid (filled in by Studio) and Terraform values: inside quotes they're text, outside a value
const filledIn = (json: string) =>
  json
    .replace(/"(?:[^"\\]|\\.)*"/g, (quoted) => quoted.replace(/\{\{[\s\S]*?\}\}|\{%[\s\S]*?%\}|\$\{[^}]*\}/g, 'x'))
    .replace(/\{\{[\s\S]*?\}\}|\$\{[^}]*\}/g, 'null');

export const taskAttributesProblem = (json: string): string | undefined => {
  if (!json.trim()) return 'empty';
  try {
    const value = JSON.parse(filledIn(json));
    return value && typeof value === 'object' && !Array.isArray(value) ? undefined : 'not an object ({ … })';
  } catch (err) {
    return (err as Error).message;
  }
};

// The attribute names, in order (top level only); none while the JSON isn't valid
export const taskAttributeNames = (json: string): string[] => {
  try {
    const value = JSON.parse(filledIn(json));
    return value && typeof value === 'object' && !Array.isArray(value) ? Object.keys(value) : [];
  } catch {
    return [];
  }
};
