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
 * A helpline's chatbots read from its live config (server/src/chatbotImport.ts).
 */
import type { ChatbotDesign } from './model';

export type ChatbotImportReport = {
  helpline: string;
  bots: { language: string; name: string; environments: string[]; questions: number; file?: string }[];
  notes: string[];
};

export type ChatbotImport = { design: ChatbotDesign; report: ChatbotImportReport };
