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

import {
  type BranchChoice,
  type DefinitionFiles,
  type HelplineSummary,
  type OperatingHoursUsage,
  type PostFlowChoices,
  type WordUsage,
} from '@tech-matters/form-builder-shared';

import { apiFetch } from './auth';

const getJson = async <T>(url: string): Promise<T> => {
  const response = await apiFetch(url);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message ?? `Request to ${url} failed (${response.status})`);
  }
  return response.json();
};

// branch: read from that flex-plugins branch instead of the default (Aselo staff)
const branchQuery = (branch?: string) => (branch ? `?branch=${encodeURIComponent(branch)}` : '');

export const fetchHelplines = (branch?: string) => getJson<HelplineSummary[]>(`/api/helplines${branchQuery(branch)}`);

export const fetchDefinitionFiles = (code: string, version: string, branch?: string) =>
  getJson<DefinitionFiles>(`/api/definitions/${code}/${version}${branchQuery(branch)}`);

export const fetchBranches = () => getJson<BranchChoice[]>('/api/branches');

export const fetchPostFlowChoices = (code: string) =>
  getJson<PostFlowChoices>(`/api/service-config/${code}/post-flow-choices`);

// Where words still appear in a helpline's twilio-iac config (Aselo staff)
export const fetchWordUsage = async (code: string, words: string[]): Promise<WordUsage[]> => {
  const response = await apiFetch(`/api/helplines/${code}/word-usage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ words }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message ?? `Looking for the words failed (${response.status})`);
  }
  return response.json();
};

// The channels and offices a helpline's Studio flows ask the operating hours about (Aselo staff)
export const fetchOperatingHoursUsage = (code: string) =>
  getJson<OperatingHoursUsage[]>(`/api/helplines/${code}/operating-hours-usage`);
