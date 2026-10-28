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
import { FAMILY_COLORS, FlowObjectType, OBJECT_TYPES, ObjectTypeInfo } from './model';
import { ObjectIcon, ShapeOutline } from './shapes';

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
  children,
  onAdd,
}: {
  item: PaletteItem;
  label: string;
  title?: string;
  children: React.ReactNode;
  onAdd: (item: PaletteItem) => void;
}) => (
  <button
    type="button"
    className="flow-palette-item"
    draggable
    title={title ?? label}
    onDragStart={(e) => {
      e.dataTransfer.setData(PALETTE_MIME, JSON.stringify(item));
      e.dataTransfer.effectAllowed = 'copy';
    }}
    onClick={() => onAdd(item)}
  >
    {children}
    <span>{label}</span>
  </button>
);

export const Palette = ({ onAdd }: Props) => (
  <aside className="flow-palette" aria-label="Objects">
    <p className="field-hint">Drag onto the board, or click to add.</p>
    <div className="flow-palette-group">
      <h3>Board</h3>
      <PaletteButton item={{ kind: 'frame' }} label="Frame" title="An area holding one flow" onAdd={onAdd}>
        <span className="flow-palette-preview">
          <FrameIcon size={18} strokeWidth={1.75} aria-hidden />
        </span>
      </PaletteButton>
      <PaletteButton item={{ kind: 'sticky' }} label="Sticky note" onAdd={onAdd}>
        <span className="flow-palette-preview">
          <StickyNote size={18} strokeWidth={1.75} aria-hidden />
        </span>
      </PaletteButton>
    </div>
    {GROUPS.map((group) => (
      <div key={group} className="flow-palette-group">
        <h3>{group}</h3>
        {(Object.entries(OBJECT_TYPES) as [FlowObjectType, ObjectTypeInfo][])
          .filter(([, info]) => info.group === group)
          .map(([type, info]) => (
            <PaletteButton
              key={type}
              item={{ kind: 'object', type }}
              label={info.label}
              title={info.studioWidget ? `${info.label} (Studio: ${info.studioWidget})` : info.label}
              onAdd={onAdd}
            >
              <span className="flow-palette-preview">
                <ShapeOutline
                  shape={info.shape}
                  width={40}
                  height={26}
                  fill={FAMILY_COLORS[info.family]}
                  stroke="#546e7a"
                />
                <ObjectIcon name={info.icon} size={13} />
              </span>
            </PaletteButton>
          ))}
      </div>
    ))}
  </aside>
);
