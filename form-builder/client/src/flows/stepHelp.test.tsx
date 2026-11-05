/** @jest-environment ./jest/jsdomEnvironment.cjs */

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

import { afterEach, describe, expect, test, jest } from '@jest/globals';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { type FlowObjectType, OBJECT_TYPES } from '@tech-matters/form-builder-shared/flows/model';

import { Palette } from './Palette';
import { STEP_DETAILS } from './stepDetails';
import { pathsOf, STEP_HELP } from './stepHelp';
import { StepInfoButton } from './StepHelpCard';

afterEach(cleanup);

describe("steps' help for helpline staff", () => {
  test('every kind of step says what it does, and describes its usual ways out', () => {
    (Object.keys(OBJECT_TYPES) as FlowObjectType[]).forEach(type => {
      expect(STEP_HELP[type].summary.length).toBeGreaterThan(20);
      // Each way out described is one the step has
      (STEP_HELP[type].paths ?? []).forEach(({ exit }) => expect(OBJECT_TYPES[type].exits ?? []).toContain(exit));
    });
  });

  test("a step's paths are those on the board: its own, and ones added (a flag, a Decision's answer)", () => {
    expect(
      pathsOf({ type: 'checkClientProfile', exits: ['blocked', 'not blocked', 'failed', 'case management'] }).map(
        path => path.exit,
      ),
    ).toEqual(['blocked', 'not blocked', 'failed', 'case management']);
    expect(pathsOf({ type: 'decision', exits: ['English', 'noMatch'] })[0].text).toBe(STEP_HELP.decision.otherPath);
    // Ways out without a description are left out
    expect(pathsOf({ type: 'other', exits: ['next'] })).toEqual([]);
  });

  test('the (i) on a step opens its help, and Escape or clicking it again closes it', () => {
    render(<StepInfoButton object={{ type: 'checkOperatingHours' }} />);
    const button = screen.getByRole('button', { name: 'What “Check operating hours” does' });
    fireEvent.click(button);
    const dialog = screen.getByRole('dialog', { name: 'Check operating hours' });
    expect(dialog.textContent).toContain('opening hours');
    expect(dialog.textContent).toContain('holiday');
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(button);
    fireEvent.pointerDown(button);
    fireEvent.click(button);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  test('“More info” adds the fuller explanation and an example, and opens short again next time', () => {
    render(<StepInfoButton object={{ type: 'checkClientProfile' }} />);
    const button = screen.getByRole('button', { name: 'What “Check client profile” does' });
    fireEvent.click(button);
    expect(screen.getByRole('dialog').textContent).not.toContain('For example');
    fireEvent.click(screen.getByRole('button', { name: 'More info' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog.textContent).toContain(STEP_DETAILS.checkClientProfile.details[0]);
    expect(dialog.textContent).toContain('case management');
    expect(screen.getByRole('button', { name: 'Less' }).getAttribute('aria-expanded')).toBe('true');
    fireEvent.keyDown(window, { key: 'Escape' });
    fireEvent.click(button);
    expect(screen.getByRole('button', { name: 'More info' })).toBeTruthy();
  });

  test('every kind of step has more info', () => {
    (Object.keys(OBJECT_TYPES) as FlowObjectType[]).forEach(type =>
      expect(STEP_DETAILS[type].details.length).toBeGreaterThan(0),
    );
  });

  test('hovering a step in the left menu shows what it does', () => {
    jest.useFakeTimers();
    try {
      render(<Palette onAdd={() => undefined} />);
      const item = screen.getByRole('button', { name: /Check client profile/ });
      fireEvent.mouseEnter(item);
      act(() => jest.advanceTimersByTime(400));
      expect(screen.getByRole('tooltip').textContent).toContain('flags');
      fireEvent.mouseLeave(item);
      expect(screen.queryByRole('tooltip')).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });
});
