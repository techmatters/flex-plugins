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
 * The objects that can be added: dragged onto the board, or clicked to add them in the middle
 * of the view.
 */
import { Frame as FrameIcon, StickyNote } from 'lucide-react';
import {
  FAMILY_COLORS,
  FlowObjectType,
  OBJECT_TYPES,
  ObjectTypeInfo,
} from '@tech-matters/form-builder-shared/flows/model';

import { ObjectIcon, ShapeOutline } from './shapes';
import { BOARD_HELP } from './stepHelp';
import { useHoverHelp } from './StepHelpCard';

export type PaletteItem = { kind: 'object'; type: FlowObjectType } | { kind: 'frame' } | { kind: 'sticky' };

export const PALETTE_MIME = 'application/x-aselo-flow-item';

const GROUPS: ObjectTypeInfo['group'][] = [
  'Start and end',
  'Checks and calls',
  'Decisions',
  'Messages',
  'Queues',
  'Other',
];

type Props = {
  onAdd: (item: PaletteItem) => void;
};

const PaletteButton = ({
  item,
  label,
  title,
  hoverProps,
  children,
  onAdd,
}: {
  item: PaletteItem;
  label: string;
  title?: string;
  // A step's: its help shown on hover
  hoverProps?: Partial<React.ButtonHTMLAttributes<HTMLButtonElement>>;
  children: React.ReactNode;
  onAdd: (item: PaletteItem) => void;
}) => (
  <button
    type="button"
    className="flow-palette-item"
    draggable
    title={hoverProps ? undefined : title ?? label}
    // eslint-disable-next-line react/jsx-props-no-spreading -- the step help's hover props
    {...hoverProps}
    onDragStart={e => {
      hoverProps?.onDragStart?.(e);
      e.dataTransfer.setData(PALETTE_MIME, JSON.stringify(item));
      e.dataTransfer.effectAllowed = 'copy';
    }}
    onClick={() => onAdd(item)}
  >
    {children}
    <span>{label}</span>
  </button>
);

// A step, with what it does when hovered
const StepPaletteButton = ({
  type,
  info,
  onAdd,
}: {
  type: FlowObjectType;
  info: ObjectTypeInfo;
  onAdd: (item: PaletteItem) => void;
}) => {
  const { triggerProps, card } = useHoverHelp(type);
  return (
    <>
      <PaletteButton item={{ kind: 'object', type }} label={info.label} hoverProps={triggerProps} onAdd={onAdd}>
        <span className="flow-palette-preview">
          <ShapeOutline shape={info.shape} width={40} height={26} fill={FAMILY_COLORS[info.family]} stroke="#546e7a" />
          <ObjectIcon name={info.icon} size={13} />
        </span>
      </PaletteButton>
      {card}
    </>
  );
};

export const Palette = ({ onAdd }: Props) => (
  <aside className="flow-palette" aria-label="Objects">
    <p className="field-hint">Drag onto the board, or click to add. Hover a step to see what it does.</p>
    <div className="flow-palette-group">
      <h3>Board</h3>
      <PaletteButton item={{ kind: 'frame' }} label="Frame" title={BOARD_HELP.frame} onAdd={onAdd}>
        <span className="flow-palette-preview">
          <FrameIcon size={18} strokeWidth={1.75} aria-hidden />
        </span>
      </PaletteButton>
      <PaletteButton item={{ kind: 'sticky' }} label="Sticky note" title={BOARD_HELP.sticky} onAdd={onAdd}>
        <span className="flow-palette-preview">
          <StickyNote size={18} strokeWidth={1.75} aria-hidden />
        </span>
      </PaletteButton>
    </div>
    {GROUPS.map(group => (
      <div key={group} className="flow-palette-group">
        <h3>{group}</h3>
        {(Object.entries(OBJECT_TYPES) as [FlowObjectType, ObjectTypeInfo][])
          .filter(([, info]) => info.group === group)
          .map(([type, info]) => (
            <StepPaletteButton key={type} type={type} info={info} onAdd={onAdd} />
          ))}
      </div>
    ))}
  </aside>
);
