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
 * Packages the changed definition files as a zip laid out like the repo, so it can be
 * unzipped at the root of a flex-plugins checkout, plus a CHANGES.md for the reviewer.
 * Phase 4 replaces the download with "Apply", which writes the same files to a branch.
 */
import JSZip from 'jszip';
import type { DefinitionFileMap } from './definitions';
import { getChangedFilePaths, summarizeContactFormChanges } from './changes';
import { summarizeSectionChanges } from './sections';
import type { ValidationIssue } from './validation';
import { changedWebchatTranslationFiles } from './webchat';
import { isServiceConfigPath, repoPathOf } from '../server/filePaths';

// Most definition files in the repo are 2-space JSON, so this keeps diffs small
export const serializeDefinitionFile = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;

type ExportInput = {
  code: string;
  version: string;
  originalFiles: DefinitionFileMap;
  draftFiles: DefinitionFileMap;
  warnings: ValidationIssue[];
  webchatDefaultLocale?: string;
  // 'pr' when the change log becomes the description of the PR that Apply opens
  target?: 'zip' | 'pr';
};

export const buildChangeLog = ({
  code,
  version,
  originalFiles,
  draftFiles,
  warnings,
  webchatDefaultLocale,
  target = 'zip',
}: ExportInput): string => {
  const changedPaths = getChangedFilePaths(originalFiles, draftFiles);
  const lines = [
    `# Form changes for ${code.toUpperCase()} (${version})`,
    '',
    target === 'pr'
      ? 'Changes made in the Aselo Builder.'
      : `Exported from the Aselo Builder on ${new Date().toISOString()}.`,
    '',
  ];

  summarizeContactFormChanges(originalFiles, draftFiles).forEach((summary) => {
    lines.push(`## ${summary.tab.kind === 'case' ? `Case section: ${summary.tab.title}` : summary.tab.title}`, '');
    summary.added.forEach((field) => lines.push(`- Added: ${field}`));
    summary.removed.forEach((field) => lines.push(`- Removed: ${field}`));
    summary.edited.forEach((field) => lines.push(`- Edited: ${field}`));
    if (summary.reordered) lines.push('- Fields were reordered');
    lines.push('');
  });

  summarizeSectionChanges(originalFiles, draftFiles, webchatDefaultLocale).forEach((summary) => {
    lines.push(`## ${summary.title}`, '');
    summary.lines.forEach((line) => lines.push(`- ${line}`));
    lines.push('');
  });

  lines.push('## Files changed', '');
  changedPaths.forEach((filePath) => lines.push(`- \`${repoPathOf(code, version, filePath)}\``));
  lines.push('');

  if (warnings.length > 0) {
    lines.push('## Warnings for the reviewer', '');
    warnings.forEach((warning) => lines.push(`- ${warning.message}`));
    lines.push('');
  }

  lines.push(
    '## Next steps',
    '',
    ...(target === 'pr'
      ? ['1. Review and merge this PR.', '2. Deploy with the "Deploy form-definitions to S3" workflow.']
      : [
          '1. Unzip at the root of a flex-plugins checkout, on a new branch.',
          '2. Run `npm test` in `lambdas/packages/hrm-form-definitions`.',
          '3. Open a PR, then deploy with the "Deploy form-definitions to S3" workflow.',
          '4. Once the PR is merged, discard the draft in the Aselo Builder.',
        ]),
    ...(changedWebchatTranslationFiles(originalFiles, draftFiles).length > 0
      ? [`- The webchat's texts changed too: redeploy the webchat for ${code.toUpperCase()} (aselo-webchat-react-app).`]
      : []),
    ...(getChangedFilePaths(originalFiles, draftFiles).some(isServiceConfigPath)
      ? [
          `- The service configuration changed too: once merged, run make service-config-plan and make service-config-apply (HL=${code}) for each environment.`,
        ]
      : []),
    '',
  );
  return lines.join('\n');
};

export const buildExportZip = (input: ExportInput): JSZip => {
  const { code, version, originalFiles, draftFiles } = input;
  const zip = new JSZip();
  getChangedFilePaths(originalFiles, draftFiles).forEach((filePath) => {
      zip.file(repoPathOf(code, version, filePath), serializeDefinitionFile(draftFiles[filePath]));
    });
  zip.file('CHANGES.md', buildChangeLog(input));
  return zip;
};

export const downloadExportZip = async (input: ExportInput) => {
  const blob = await buildExportZip(input).generateAsync({ type: 'blob' });
  const timestamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `form-builder-${input.code}-${input.version}-${timestamp}.zip`;
  link.click();
  URL.revokeObjectURL(url);
};
