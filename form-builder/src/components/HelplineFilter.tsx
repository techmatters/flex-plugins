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
 * Shows one helpline's rows in a start page table ('' for all)
 */
import '../designStatus.css';

type Props = {
  // The helplines in the table
  codes: string[];
  value: string;
  onChange: (code: string) => void;
};

export const HelplineFilter = ({ codes, value, onChange }: Props) => {
  const choices = [...new Set(codes)].sort();
  if (choices.length === 0 && !value) return null;
  return (
    <label className="area-home-helpline">
      Helpline{' '}
      <select value={value} aria-label="Show helpline" onChange={(e) => onChange(e.target.value)}>
        <option value="">All helplines</option>
        {choices.map((code) => (
          <option key={code} value={code}>
            {code.toUpperCase()}
          </option>
        ))}
      </select>
    </label>
  );
};
