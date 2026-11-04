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
 * A step's help as a card floating next to what it's about: on hover in the left menu, and from
 * the (i) on a step on the board. Drawn over the page, so the menu's scrolling doesn't cut it off.
 */
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Info, X } from 'lucide-react';
import type { FlowObject } from '@tech-matters/form-builder-shared/flows/model';
import { OBJECT_TYPES } from '@tech-matters/form-builder-shared/flows/model';
import { ObjectIcon } from './shapes';
import { STEP_DETAILS } from './stepDetails';
import { pathsOf, STEP_HELP } from './stepHelp';

type Side = 'right' | 'below';
const GAP = 10;
const MARGIN = 12;

// The card, placed beside (right) or under (below) its anchor and kept on screen, its arrow on the anchor
const FloatingCard = ({
  anchor,
  side,
  role,
  id,
  label,
  onClose,
  owner,
  layoutKey,
  children,
}: {
  anchor: DOMRect;
  side: Side;
  role: 'tooltip' | 'dialog';
  id?: string;
  label?: string;
  onClose?: () => void;
  // What opened it: clicking it again toggles it, rather than closing and reopening
  owner?: React.RefObject<HTMLElement>;
  // Placed again when it changes (its content grew)
  layoutKey?: unknown;
  children: React.ReactNode;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [place, setPlace] = useState<{ left: number; top: number; arrow: number; flipped: boolean }>();
  useLayoutEffect(() => {
    const card = ref.current?.getBoundingClientRect();
    if (!card) return;
    const clamp = (value: number, size: number, limit: number) =>
      Math.max(MARGIN, Math.min(value, limit - size - MARGIN));
    if (side === 'right') {
      const top = clamp(anchor.top + anchor.height / 2 - 28, card.height, window.innerHeight);
      setPlace({ left: anchor.right + GAP, top, arrow: anchor.top + anchor.height / 2 - top, flipped: false });
    } else {
      // Under it, or over it when there's no room below
      const flipped = anchor.bottom + GAP + card.height > window.innerHeight - MARGIN;
      const top = flipped ? anchor.top - GAP - card.height : anchor.bottom + GAP;
      const left = clamp(anchor.left + anchor.width / 2 - card.width / 2, card.width, window.innerWidth);
      setPlace({ left, top: Math.max(MARGIN, top), arrow: anchor.left + anchor.width / 2 - left, flipped });
    }
  }, [anchor, side, layoutKey]);
  // Closed by Escape or a click anywhere else
  useEffect(() => {
    if (!onClose) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!ref.current?.contains(target) && !owner?.current?.contains(target)) onClose();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer, true);
    // Scrolling the board moves the step away; scrolling the card itself doesn't
    const onWheel = (e: WheelEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer, true);
      window.removeEventListener('wheel', onWheel);
    };
  }, [onClose, owner]);
  const arrowStyle = side === 'right' ? { top: place?.arrow ?? 28 } : { left: place?.arrow ?? '50%' };
  return createPortal(
    <div
      ref={ref}
      id={id}
      role={role}
      aria-label={label}
      className={`step-help-card step-help-${side} ${place?.flipped ? 'flipped' : ''} ${place ? 'shown' : ''}`}
      style={place ? { left: place.left, top: place.top } : { left: -9999, top: 0 }}
      onPointerDown={e => e.stopPropagation()}
    >
      <span className="step-help-arrow" style={arrowStyle} aria-hidden />
      <div className="step-help-scroll">{children}</div>
    </div>,
    document.body,
  );
};

// What it says: the step, what it does and where the contact goes next. Then, on the board, "More
// info" (a fuller explanation, an example and a tip); in the menu, where to find it
const HelpContent = ({
  object,
  onClose,
  expanded,
  onExpand,
}: {
  object: Pick<FlowObject, 'type' | 'exits' | 'studio'>;
  onClose?: () => void;
  expanded?: boolean;
  onExpand?: (expanded: boolean) => void;
}) => {
  const info = OBJECT_TYPES[object.type];
  const help = STEP_HELP[object.type];
  const more = STEP_DETAILS[object.type];
  const moreId = useId();
  const paths = pathsOf(object);
  return (
    <>
      <div className="step-help-title">
        <span className="step-help-icon">
          <ObjectIcon name={info.icon} size={15} />
        </span>
        <strong>{info.label}</strong>
        {onClose && (
          <button type="button" className="step-help-close" aria-label="Close" onClick={onClose}>
            <X size={14} aria-hidden />
          </button>
        )}
      </div>
      <p>{help.summary}</p>
      {paths.length > 0 && (
        <>
          <p className="step-help-heading">Where the contact goes next</p>
          <ul className="step-help-paths">
            {paths.map(({ exit, text }) => (
              <li key={exit}>
                <span className="step-help-exit">{exit}</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      {onExpand ? (
        <>
          {expanded && (
            <div id={moreId} className="step-help-more">
              {more.details.map(paragraph => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {more.example && (
                <p className="step-help-example">
                  <span>For example</span>
                  {more.example}
                </p>
              )}
              {help.tip && <p className="step-help-tip">{help.tip}</p>}
            </div>
          )}
          <button
            type="button"
            className={`step-help-toggle ${expanded ? 'expanded' : ''}`}
            aria-expanded={Boolean(expanded)}
            aria-controls={moreId}
            onClick={() => onExpand(!expanded)}
          >
            {expanded ? 'Less' : 'More info'}
            <ChevronDown size={14} aria-hidden />
          </button>
        </>
      ) : (
        <p className="step-help-footnote">More info and examples: the (i) on the step, once it’s on the board.</p>
      )}
    </>
  );
};

// A step in the left menu, its help shown after a moment's hover (or on keyboard focus)
export const useHoverHelp = (type: FlowObject['type']) => {
  const [anchor, setAnchor] = useState<DOMRect>();
  const timer = useRef<number>();
  const id = useId();
  const show = (target: HTMLElement, delay: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAnchor(target.getBoundingClientRect()), delay);
  };
  const hide = () => {
    window.clearTimeout(timer.current);
    setAnchor(undefined);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return {
    triggerProps: {
      'aria-describedby': anchor ? id : undefined,
      onMouseEnter: (e: React.MouseEvent<HTMLElement>) => show(e.currentTarget, 350),
      onMouseLeave: hide,
      onFocus: (e: React.FocusEvent<HTMLElement>) => show(e.currentTarget, 0),
      onBlur: hide,
      onDragStart: hide,
    },
    card: anchor && (
      <FloatingCard anchor={anchor} side="right" role="tooltip" id={id}>
        <HelpContent object={{ type }} />
      </FloatingCard>
    ),
  };
};

// The (i) on a step on the board: its help in a bubble until closed
export const StepInfoButton = ({ object }: { object: Pick<FlowObject, 'type' | 'exits' | 'studio'> }) => {
  const [anchor, setAnchor] = useState<DOMRect>();
  const [expanded, setExpanded] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const label = OBJECT_TYPES[object.type].label;
  const close = useCallback(() => {
    setAnchor(undefined);
    setExpanded(false);
  }, []);
  return (
    <>
      <button
        ref={button}
        type="button"
        className={`step-info-button nodrag nopan ${anchor ? 'open' : ''}`}
        aria-label={`What “${label}” does`}
        aria-expanded={Boolean(anchor)}
        title="What this step does"
        onPointerDown={e => e.stopPropagation()}
        onDoubleClick={e => e.stopPropagation()}
        onClick={e => {
          e.stopPropagation();
          if (anchor) close();
          else setAnchor(e.currentTarget.getBoundingClientRect());
        }}
      >
        <Info size={13} strokeWidth={2.25} aria-hidden />
      </button>
      {anchor && (
        <FloatingCard
          anchor={anchor}
          side="below"
          role="dialog"
          label={label}
          owner={button}
          layoutKey={expanded}
          onClose={close}
        >
          <HelpContent object={object} onClose={close} expanded={expanded} onExpand={setExpanded} />
        </FloatingCard>
      )}
    </>
  );
};
