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
 * Task conditions as coloured chips, so a rule reads at a glance: channel (with its icon), service,
 * language, transfers, offline contacts, and the helpline's own attributes, each its own colour.
 */
import {
  ArrowLeftRight,
  Camera,
  ClipboardList,
  Code,
  Globe,
  Languages,
  LucideIcon,
  MessageCircle,
  MessageSquare,
  Phone,
  Send,
  Tag,
  Voicemail,
} from 'lucide-react';
import type { Condition } from './model';
import { attributeLabel, valueLabel } from './model';

export type AttributeFamily = 'channel' | 'service' | 'language' | 'transfer' | 'offline' | 'other';

export const FAMILIES: { family: AttributeFamily; label: string; icon: LucideIcon }[] = [
  { family: 'channel', label: 'Channel', icon: MessageSquare },
  { family: 'service', label: 'Service', icon: Tag },
  { family: 'language', label: 'Language', icon: Languages },
  { family: 'transfer', label: 'Transfer', icon: ArrowLeftRight },
  { family: 'offline', label: 'Offline contact', icon: ClipboardList },
  { family: 'other', label: 'Other', icon: Code },
];

export const familyOf = (attribute: string): AttributeFamily => {
  if (/channelType$/i.test(attribute) || attribute === 'twilioNumber') return 'channel';
  if (/(^|\.)serviceLanguage$|(^|\.)language$|counselingLanguage/i.test(attribute)) return 'language';
  if (/(^|\.)service$|helpline/i.test(attribute)) return 'service';
  if (attribute === 'transferTargetType' || attribute === 'targetSid') return 'transfer';
  if (attribute === 'isContactlessTask') return 'offline';
  return 'other';
};

const CHANNEL_ICONS: Record<string, LucideIcon> = {
  voice: Phone,
  voicemail: Voicemail,
  sms: MessageSquare,
  modica: MessageSquare,
  web: Globe,
  chat: Globe,
  whatsapp: MessageCircle,
  facebook: MessageCircle,
  instagram: Camera,
  telegram: Send,
};

const iconFor = (condition: Condition): LucideIcon => {
  if (condition.kind === 'custom') return Code;
  const family = familyOf(condition.attribute);
  if (family === 'channel' && condition.values.length === 1 && condition.operator !== '!=') {
    return CHANNEL_ICONS[String(condition.values[0])] ?? MessageSquare;
  }
  return FAMILIES.find((candidate) => candidate.family === family)!.icon;
};

const QUEUE_REFERENCE = /^\$\{task_queues(?:\.([\w-]+)|\[["']([^"']+)["']\])\}$/;

// "Voice or SMS", "not Spanish", "queue Master"
const valuesText = (condition: Extract<Condition, { kind: 'compare' }>, queueName: (key: string) => string) => {
  const values = condition.values.map((value) => {
    const queue = typeof value === 'string' ? value.match(QUEUE_REFERENCE) : undefined;
    return queue ? `queue ${queueName(queue[1] ?? queue[2])}` : valueLabel(value);
  });
  const joined =
    values.length <= 1 ? values.join('') : `${values.slice(0, -1).join(', ')} or ${values[values.length - 1]}`;
  return condition.operator === '!=' || condition.operator === 'NOT IN' ? `not ${joined}` : joined;
};

export const ConditionChip = ({
  condition,
  queueName = (key) => key,
}: {
  condition: Condition;
  queueName?: (key: string) => string;
}) => {
  const Icon = iconFor(condition);
  if (condition.kind === 'custom') {
    return (
      <span className="routing-cond-chip other" title={condition.expression}>
        <Icon size={12} aria-hidden /> {condition.expression}
      </span>
    );
  }
  const family = familyOf(condition.attribute);
  // The channel's value says it all ("Voice"); others say what they are ("Language: Spanish")
  const text = valuesText(condition, queueName);
  return (
    <span
      className={`routing-cond-chip ${family}`}
      title={`${attributeLabel(condition.attribute)}: ${text} (${condition.attribute})`}
    >
      <Icon size={12} aria-hidden />
      {family === 'channel' && condition.attribute === 'channelType'
        ? text
        : `${attributeLabel(condition.attribute)}: ${text}`}
    </span>
  );
};

export const FamilyLegend = () => (
  <div className="routing-legend" aria-label="Legend">
    {FAMILIES.map(({ family, label, icon: Icon }) => (
      <span key={family} className={`routing-cond-chip ${family}`}>
        <Icon size={12} aria-hidden /> {label}
      </span>
    ))}
  </div>
);
