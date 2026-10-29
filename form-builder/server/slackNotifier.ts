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
 * Deployed "Submit for review": a message in the Aselo team's Slack channel, through an incoming
 * webhook (its URL is a secret, kept in SSM).
 */
import type { Notifier } from './api';

export class SlackNotifier implements Notifier {
  constructor(
    private readonly webhookUrl: string,
    // Where the builder is served, for the link in the message
    private readonly appUrl: string,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async draftSubmitted(draft: Parameters<Notifier['draftSubmitted']>[0], user: Parameters<Notifier['draftSubmitted']>[1]) {
    const fileCount = Object.keys(draft.files).length;
    const text = [
      `*${draft.code.toUpperCase()}* form changes (${draft.version}) were submitted for review by ${user.name}.`,
      `${fileCount} file${fileCount === 1 ? '' : 's'} changed. Review and apply them in the Aselo Builder: ${this.appUrl}`,
    ].join('\n');
    const response = await this.fetchImpl(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) throw new Error(`Slack notification failed (${response.status})`);
  }
}
