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
 * Where words still appear in a helpline's twilio-iac config, which the builder doesn't change:
 * its Studio flow templates, the texts in its .hcl files and its chatbots
 * (server/src/wordUsage.ts finds them).
 */
export type WordUsageKind = 'studio' | 'chatbot' | 'config';

export type WordUsage = {
  // Under twilio-iac/helplines, e.g. usnm/templates/studio-flows/messaging.tftpl
  file: string;
  kind: WordUsageKind;
  line: number;
  // The line, cut down around the words when it's long
  text: string;
  // The words found in it, as written there
  words: string[];
};
