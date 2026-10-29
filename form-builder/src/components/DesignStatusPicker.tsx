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
 * A design's status (designStatus.ts) as a coloured pill: a dropdown for Aselo staff, a badge for
 * everyone else. "New" is shown next to it for designs not in the live config yet.
 */
import type { DesignStatus } from '../designStatus';
import { DESIGN_STATUSES, statusLabel } from '../designStatus';
import '../designStatus.css';

type BadgeProps = { status: DesignStatus; isNew?: boolean };

export const DesignStatusBadge = ({ status, isNew }: BadgeProps) => (
  <span className="design-status-group">
    {isNew && <span className="design-status design-status-new">New</span>}
    <span
      className={`design-status design-status-${status}`}
      title={DESIGN_STATUSES.find((candidate) => candidate.value === status)?.hint}
    >
      {statusLabel(status)}
    </span>
  </span>
);

type PickerProps = BadgeProps & {
  editable: boolean;
  onChange: (status: DesignStatus) => void;
  // For the dropdown's accessible name, e.g. "Status of Pre-survey"
  label?: string;
};

export const DesignStatusPicker = ({ status, isNew, editable, onChange, label = 'Status' }: PickerProps) => {
  if (!editable) return <DesignStatusBadge status={status} isNew={isNew} />;
  return (
    <span className="design-status-group">
      {isNew && <span className="design-status design-status-new">New</span>}
      <select
        className={`design-status design-status-select design-status-${status}`}
        aria-label={label}
        value={status}
        title={DESIGN_STATUSES.find((candidate) => candidate.value === status)?.hint}
        onChange={(e) => onChange(e.target.value as DesignStatus)}
      >
        {DESIGN_STATUSES.map((candidate) => (
          <option key={candidate.value} value={candidate.value}>
            {candidate.label}
          </option>
        ))}
      </select>
    </span>
  );
};
