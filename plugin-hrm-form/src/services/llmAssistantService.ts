/**
 * Copyright (C) 2021-2023 Technology Matters
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

import { getLlmConfig } from '../hrmConfig';
import { getValidToken } from '../authentication';
import { ApiError, fetchApi } from './fetchApi';

export type TranscriptForLlmAssistant = { from: string; role: string; content: string }[];
type LlmAssistantSummary = { summaryText: string; id: string };

export const generateSummary = (
  contactId: string,
  currentChatTranscript: TranscriptForLlmAssistant,
): Promise<LlmAssistantSummary> => {
  const { assistantBaseUrl } = getLlmConfig();
  const token = getValidToken();
  if (token instanceof Error) throw new ApiError(`Aborting request due to token issue: ${token.message}`, {}, token);

  return fetchApi(new URL(assistantBaseUrl), `summarize/${contactId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method: 'POST',
    body: JSON.stringify({ transcript: currentChatTranscript }),
  });
};
