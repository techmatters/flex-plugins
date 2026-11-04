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
 * A helpline's Studio flows read from its live config (server/src/flowImport.ts).
 */
import type { BoardContent } from './model.ts';

export type ImportedRecording = {
  fileName: string;
  environment: 'staging' | 'production';
  sourceUrl: string;
  // The flow's own recordings folder, for flows sharing a template (see recordingStores.ts)
  folder?: string;
  // The widgets playing it, when the file isn't named after them: its standard names (<widget>.mp3)
  widgets?: string[];
};

export type ImportedFlow = {
  title: string;
  name: string;
  template: string;
  channels: string[];
  widgets: number;
  // Where the flow is live: the environment files that use it
  environments: Environment[];
  // For each channel, the environments it's in (they can differ, e.g. a channel only in staging)
  channelEnvironments: Record<string, Environment[]>;
  // The Studio flows sharing this template, when there are several (one board, a variant each)
  variants?: string[];
};

export type ImportReport = {
  helpline: string;
  // The environment files found
  environments: string[];
  flows: ImportedFlow[];
  // What a person should look at, in plain language
  notes: string[];
};

// One board per Studio flow, as in Studio
export type ImportedBoard = {
  title: string;
  content: BoardContent;
  // The recordings its voice messages play ("<folder>/<file>" for variants), to copy only those of the boards chosen
  recordingFiles: string[];
};

export type HelplineImport = {
  boards: ImportedBoard[];
  report: ImportReport;
  recordings: ImportedRecording[];
};

export type Environment = 'production' | 'staging';
