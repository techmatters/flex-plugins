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
 * The flowchart shapes (ISO 5807) and the icons inside objects. Shapes are drawn at the object's
 * real size, so lines keep the same thickness however an object is resized.
 */
import {
  BellRing,
  Bot,
  BotOff,
  Braces,
  CircleStop,
  ClipboardList,
  DatabaseZap,
  Clock,
  ExternalLink,
  GitBranch,
  Globe,
  Grid3x3,
  Inbox,
  Layers,
  LucideIcon,
  MessageCircle,
  MessageSquare,
  MessageSquareReply,
  MessageSquareX,
  Monitor,
  Phone,
  PhoneForwarded,
  Repeat,
  ServerOff,
  Timer,
  Type,
  UserCheck,
  Users,
  UserSearch,
  Variable,
  Voicemail,
  Volume2,
  Webhook,
} from 'lucide-react';
import type { Shape } from './model';

export const ICONS: Record<string, LucideIcon> = {
  BellRing,
  Bot,
  BotOff,
  Braces,
  CircleStop,
  ClipboardList,
  DatabaseZap,
  Clock,
  ExternalLink,
  GitBranch,
  Globe,
  Grid3x3,
  Inbox,
  Layers,
  MessageCircle,
  MessageSquare,
  MessageSquareReply,
  MessageSquareX,
  Monitor,
  Phone,
  PhoneForwarded,
  Repeat,
  ServerOff,
  Timer,
  Type,
  UserCheck,
  Users,
  UserSearch,
  Variable,
  Voicemail,
  Volume2,
  Webhook,
};

export const ObjectIcon = ({ name, size = 18 }: { name: string; size?: number }) => {
  const Icon = ICONS[name] ?? Type;
  return <Icon size={size} strokeWidth={1.75} aria-hidden />;
};

type ShapeProps = {
  shape: Shape;
  width: number;
  height: number;
  fill: string;
  stroke: string;
};

// Half the stroke, so lines aren't cut at the edges
const S = 1.5;

export const ShapeOutline = ({ shape, width: w, height: h, fill, stroke }: ShapeProps) => {
  if (shape === 'none' || w <= 0 || h <= 0) return null;
  const common = { fill, stroke, strokeWidth: 2 * S, vectorEffect: 'non-scaling-stroke' as const };
  const r = S;
  const right = w - S;
  const bottom = h - S;
  let body: JSX.Element;
  switch (shape) {
    case 'pill':
      body = <rect x={r} y={r} width={w - 2 * S} height={h - 2 * S} rx={(h - 2 * S) / 2} {...common} />;
      break;
    case 'rounded':
      body = <rect x={r} y={r} width={w - 2 * S} height={h - 2 * S} rx={12} {...common} />;
      break;
    case 'predefined':
      // A box with double sides: a call to something defined elsewhere (subflow, function)
      body = (
        <>
          <rect x={r} y={r} width={w - 2 * S} height={h - 2 * S} rx={6} {...common} />
          <line x1={12} y1={S} x2={12} y2={bottom} stroke={stroke} strokeWidth={2 * S} />
          <line x1={w - 12} y1={S} x2={w - 12} y2={bottom} stroke={stroke} strokeWidth={2 * S} />
        </>
      );
      break;
    case 'diamond':
      body = <polygon points={`${w / 2},${S} ${right},${h / 2} ${w / 2},${bottom} ${S},${h / 2}`} {...common} />;
      break;
    case 'parallelogram': {
      const k = Math.min(22, w * 0.12);
      body = <polygon points={`${k},${S} ${right},${S} ${w - k},${bottom} ${S},${bottom}`} {...common} />;
      break;
    }
    case 'manualInput':
      body = <polygon points={`${S},${h * 0.32} ${right},${S} ${right},${bottom} ${S},${bottom}`} {...common} />;
      break;
    case 'document': {
      const wave = Math.min(14, h * 0.18);
      body = (
        <path
          d={`M${S},${S} H${right} V${bottom - wave} Q${w * 0.75},${bottom - 2 * wave} ${w / 2},${bottom - wave} T${S},${bottom - wave} Z`}
          {...common}
        />
      );
      break;
    }
    case 'cylinder': {
      const ry = Math.min(12, h * 0.15);
      const rx = (w - 2 * S) / 2;
      body = (
        <>
          <path
            d={`M${S},${S + ry} A${rx},${ry} 0 0 1 ${right},${S + ry} V${bottom - ry} A${rx},${ry} 0 0 1 ${S},${bottom - ry} Z`}
            {...common}
          />
          <path
            d={`M${S},${S + ry} A${rx},${ry} 0 0 0 ${right},${S + ry}`}
            fill="none"
            stroke={stroke}
            strokeWidth={2 * S}
          />
        </>
      );
      break;
    }
    case 'delay': {
      const radius = Math.min((h - 2 * S) / 2, w / 2);
      body = (
        <path
          d={`M${S},${S} H${right - radius} A${radius},${radius} 0 0 1 ${right - radius},${bottom} H${S} Z`}
          {...common}
        />
      );
      break;
    }
    case 'offPage': {
      const tip = Math.min(24, w * 0.2);
      body = (
        <polygon
          points={`${S},${S} ${right - tip},${S} ${right},${h / 2} ${right - tip},${bottom} ${S},${bottom}`}
          {...common}
        />
      );
      break;
    }
    default:
      body = <rect x={r} y={r} width={w - 2 * S} height={h - 2 * S} rx={3} {...common} />;
  }
  return (
    <svg className="flow-shape" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      {body}
    </svg>
  );
};
