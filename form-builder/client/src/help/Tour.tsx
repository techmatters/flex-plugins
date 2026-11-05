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
 * A guide's "Show me": its steps one at a time, each highlighting the real thing on the page (a
 * button, a heading...) with a bubble saying what to do. Nothing is blocked: the person can click
 * what's highlighted (which moves on by itself) or anything else, and leave whenever they like.
 * What a step points at may not be on screen yet (e.g. a dialog not opened): it says so.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';

import type { TourStep } from './articles';
import { HelpMarkdown } from './HelpMarkdown';
import { useAppDispatch, useAppSelector } from '../app/store';
import { selectApp, tourEnded, tourStepAdvanced, tourStepBack } from '../app/appSlice';

const PADDING = 6;
const GAP = 12;
const MARGIN = 12;

const isVisible = (element: Element) => {
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 && !element.closest('.help-panel, .tour-card');
};

const normalize = (text: string | null | undefined) => (text ?? '').replace(/\s+/g, ' ').trim().toLowerCase();

/**
 * What a step points at, visible on the page: `button:<its text>` (exact, then starting with it,
 * then containing it), `text:<an element's whole text>`, `label:<aria-label>` or `css:<selector>`.
 */
export const findTarget = (target: string, root: ParentNode = document): HTMLElement | undefined => {
  const [kind, ...rest] = target.split(':');
  const value = rest.join(':').trim();
  const visible = (elements: Iterable<Element>) => [...elements].filter(isVisible) as HTMLElement[];
  if (kind === 'css') {
    try {
      return visible(root.querySelectorAll(value))[0];
    } catch {
      return undefined;
    }
  }
  if (kind === 'label') {
    return visible(root.querySelectorAll('[aria-label]')).find(element => element.getAttribute('aria-label') === value);
  }
  const wanted = normalize(value);
  if (kind === 'button') {
    const buttons = visible(root.querySelectorAll('button, [role="button"], a'));
    return (
      buttons.find(button => normalize(button.textContent) === wanted) ??
      buttons.find(button => normalize(button.textContent).startsWith(wanted)) ??
      buttons.find(button => normalize(button.textContent).includes(wanted))
    );
  }
  if (kind === 'text') {
    // The innermost element with exactly that text
    const matches = visible(
      root.querySelectorAll('h1, h2, h3, h4, h5, label, legend, th, span, strong, p, div'),
    ).filter(element => normalize(element.textContent) === wanted);
    return matches.find(element => !matches.some(other => other !== element && element.contains(other)));
  }
  return undefined;
};

const NO_STEPS: TourStep[] = [];

// The tour started (app/appSlice.ts), on its step
// eslint-disable-next-line sonarjs/cognitive-complexity
export const Tour = () => {
  const dispatch = useAppDispatch();
  const { tour, tourStep: index } = useAppSelector(selectApp);
  const title = tour?.title ?? '';
  const steps = tour?.tour ?? NO_STEPS;
  // Where what's highlighted is, and where the bubble goes: measured on the page
  const [rect, setRect] = useState<DOMRect>();
  const target = useRef<HTMLElement>();
  const card = useRef<HTMLDivElement>(null);
  const [cardPlace, setCardPlace] = useState<{ left: number; top: number }>();
  const step = steps[index];
  const last = index === steps.length - 1;
  const next = () => dispatch(last ? tourEnded() : tourStepAdvanced());

  // Finds what the step points at, and follows it as the page moves (it may appear later)
  useEffect(() => {
    target.current = undefined;
    setRect(undefined);
    if (!step) return undefined;
    let scrolled = false;
    const find = () => {
      const element = findTarget(step.target);
      target.current = element;
      if (element && !scrolled) {
        scrolled = true;
        element.scrollIntoView?.({ block: 'center', inline: 'nearest', behavior: 'smooth' });
      }
      const box = element?.getBoundingClientRect();
      setRect(current =>
        box &&
        current &&
        current.top === box.top &&
        current.left === box.left &&
        current.width === box.width &&
        current.height === box.height
          ? current
          : box,
      );
    };
    find();
    const timer = window.setInterval(find, 250);
    return () => window.clearInterval(timer);
  }, [step]);

  // Clicking what's highlighted moves on, after the click has done its work
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (target.current?.contains(e.target as Node)) window.setTimeout(() => dispatch(tourStepAdvanced()), 300);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [dispatch]);

  // Escape leaves the tour (and only the tour)
  const running = Boolean(step);
  useEffect(() => {
    if (!running) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopImmediatePropagation();
      dispatch(tourEnded());
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [running, dispatch]);

  // The bubble: under what's highlighted, or above it when there's no room; centred when it's not on screen
  useLayoutEffect(() => {
    const box = card.current?.getBoundingClientRect();
    if (!box) return;
    const clamp = (value: number, size: number, limit: number) =>
      Math.max(MARGIN, Math.min(value, limit - size - MARGIN));
    if (!rect) {
      setCardPlace({ left: (window.innerWidth - box.width) / 2, top: window.innerHeight - box.height - 32 });
      return;
    }
    const below = rect.bottom + PADDING + GAP;
    const top =
      below + box.height <= window.innerHeight - MARGIN
        ? below
        : Math.max(MARGIN, rect.top - PADDING - GAP - box.height);
    setCardPlace({ left: clamp(rect.left + rect.width / 2 - box.width / 2, box.width, window.innerWidth), top });
  }, [rect, index]);

  if (!step) return null;
  return createPortal(
    <>
      {rect && (
        <div
          className="tour-spotlight"
          aria-hidden
          style={{
            left: rect.left - PADDING,
            top: rect.top - PADDING,
            width: rect.width + PADDING * 2,
            height: rect.height + PADDING * 2,
          }}
        />
      )}
      <div
        ref={card}
        className={`tour-card ${cardPlace ? 'shown' : ''}`}
        role="dialog"
        aria-label={`Show me: ${title}`}
        style={cardPlace ?? { left: -9999, top: 0 }}
      >
        <div className="tour-card-head">
          <span className="tour-progress">
            Step {index + 1} of {steps.length}
          </span>
          <button type="button" className="tour-close" aria-label="End the tour" onClick={() => dispatch(tourEnded())}>
            <X size={14} aria-hidden />
          </button>
        </div>
        <HelpMarkdown source={step.text} onOpenArticle={() => undefined} />
        {!rect && (
          <p className="tour-missing">{step.missing ?? 'It isn’t on the screen right now: go on when you’re ready.'}</p>
        )}
        <div className="tour-actions">
          {index > 0 && (
            <button type="button" className="link-button" onClick={() => dispatch(tourStepBack())}>
              <ArrowLeft size={14} aria-hidden /> Back
            </button>
          )}
          <button type="button" className="primary-button tour-next" onClick={next}>
            {last ? 'Done' : 'Next'} {!last && <ArrowRight size={14} aria-hidden />}
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
};
