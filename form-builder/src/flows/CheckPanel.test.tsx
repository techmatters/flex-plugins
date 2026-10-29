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

// @vitest-environment jsdom

import { useState } from 'react';
import { afterEach, describe, expect, test } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { Issue } from './checks';
import { splitIgnored } from './checks';
import { CheckPanel } from './CheckPanel';

afterEach(cleanup);

const ISSUES: Issue[] = [
  { key: 'a', severity: 'error', message: 'A mistake', objectId: 'x' },
  { key: 'b', severity: 'warning', message: '“Incoming contact” should go to the system-down subflow', objectId: 'y' },
];

const Harness = ({ readOnly = false }: { readOnly?: boolean }) => {
  const [ignoredKeys, setIgnoredKeys] = useState<string[]>([]);
  const { active, ignored } = splitIgnored(ISSUES, ignoredKeys);
  return (
    <CheckPanel
      issues={active}
      ignored={ignored}
      readOnly={readOnly}
      onShow={() => {}}
      onEndHere={() => {}}
      onIgnore={(key, ignore) =>
        setIgnoredKeys((current) => (ignore ? [...current, key] : current.filter((other) => other !== key)))
      }
    />
  );
};

describe('the Check panel', () => {
  test('a warning is ignored, listed apart, and brought back', () => {
    render(<Harness />);
    expect(screen.getByText('1 error, 1 warning')).toBeTruthy();
    // Errors can't be ignored
    expect(screen.queryByRole('button', { name: 'Ignore: A mistake' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /^Ignore: “Incoming contact”/ }));
    expect(screen.getByText('1 error, 0 warnings · 1 ignored')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Show 1 ignored warning' }));
    fireEvent.click(screen.getByRole('button', { name: /^Stop ignoring: / }));
    expect(screen.getByText('1 error, 1 warning')).toBeTruthy();
  });

  test('helpline staff (view only) see ignored warnings without changing them', () => {
    render(<Harness readOnly />);
    expect(screen.queryByRole('button', { name: /^Ignore/ })).toBeNull();
  });
});
