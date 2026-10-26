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
 * How the API behaves when running locally from a repo checkout:
 * - you're Aselo staff (set FORM_BUILDER_ROLE=helpline-staff and FORM_BUILDER_HELPLINES=usnm
 *   to try the helpline staff view);
 * - "Apply" writes the draft into the checkout, for you to review with git diff, then commit
 *   and open a PR as usual (deployed, Apply will open the PR through the GitHub App);
 * - "Submit for review" is logged (deployed, it notifies Slack and support@aselo.org).
 */
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import type { ApiUser, ApplyResult, DraftApplier, Notifier } from './api';
import type { Draft } from './drafts';
import { isWebchatTranslationsPath, WEBCHAT_TRANSLATIONS_PREFIX } from './filePaths';

export const localUser = (env: Record<string, string | undefined> = process.env): ApiUser => {
  const role = env.FORM_BUILDER_ROLE === 'helpline-staff' ? 'helpline-staff' : 'aselo-staff';
  const helplines =
    role === 'aselo-staff'
      ? 'all'
      : (env.FORM_BUILDER_HELPLINES ?? '')
          .split(',')
          .map((code) => code.trim())
          .filter(Boolean);
  return {
    name: env.FORM_BUILDER_USER ?? os.userInfo().username,
    role,
    helplines,
  };
};

/**
 * JSON in the same style as the file it replaces (indentation, line endings and final
 * newline), so the diff only shows real changes. New files get 2-space JSON, which most
 * files use.
 */
export const serializeLike = (value: unknown, existingText?: string) => {
  const indent = existingText?.match(/^﻿?[{[]\r?\n([ \t]+)/)?.[1] ?? '  ';
  const finalNewline = existingText === undefined || existingText.endsWith('\n');
  const text = `${JSON.stringify(value, null, indent)}${finalNewline ? '\n' : ''}`;
  return existingText?.includes('\r\n') ? text.replace(/\n/g, '\r\n') : text;
};

export class LocalApplier implements DraftApplier {
  constructor(
    private readonly formDefinitionsDir: string,
    private readonly repoRoot: string,
    private readonly webchatConfigDir?: string,
  ) {}

  private targetOf(draft: Draft, filePath: string) {
    if (isWebchatTranslationsPath(filePath)) {
      if (!this.webchatConfigDir) throw new Error('No webchat config directory to write to');
      const fileName = filePath.slice(WEBCHAT_TRANSLATIONS_PREFIX.length);
      return path.join(this.webchatConfigDir, draft.code, 'translations', fileName);
    }
    return path.join(this.formDefinitionsDir, draft.code, draft.version, ...filePath.split('/'));
  }

  async apply(draft: Draft): Promise<ApplyResult> {
    const written: string[] = [];
    for (const [filePath, value] of Object.entries(draft.files)) {
      const target = this.targetOf(draft, filePath);
      const existingText = await fs.readFile(target, 'utf8').catch(() => undefined);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, serializeLike(value, existingText));
      written.push(path.relative(this.repoRoot, target).split(path.sep).join('/'));
    }
    return {
      description:
        'The changes were written to your local checkout. Review them with git diff, then commit and open a PR as usual.',
      written,
    };
  }
}

export const localNotifier: Notifier = {
  async draftSubmitted(draft, user) {
    // eslint-disable-next-line no-console
    console.info(
      `[form-builder] ${user.name} submitted ${draft.code}/${draft.version} for review (${Object.keys(draft.files).length} files). Deployed, this notifies Slack and support@aselo.org.`,
    );
  },
};
