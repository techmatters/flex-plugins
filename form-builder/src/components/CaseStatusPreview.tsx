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

import type { StatusInfo } from '@hrm-form-definitions/formDefinition/types';

type Props = {
  statuses: StatusInfo[];
};

export const CaseStatusPreview = ({ statuses }: Props) => {
  const labelFor = (value: string) =>
    statuses.find((status) => status.value === value)?.label ?? value;

  return (
    <section className="panel">
      <h2>Case statuses</h2>
      {statuses.length === 0 ? (
        <p className="muted">No case statuses are configured.</p>
      ) : (
        <table className="status-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Can change to</th>
            </tr>
          </thead>
          <tbody>
            {statuses.map((status) => (
              <tr key={status.value}>
                <td>
                  <span className="status-pill" style={{ background: status.color }}>
                    {status.label}
                  </span>
                </td>
                <td>
                  {status.transitions.length === 0 ? (
                    <span className="muted">— (final status)</span>
                  ) : (
                    status.transitions.map(labelFor).join(', ')
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};
