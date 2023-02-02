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

import path from 'path';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Download } from 'playwright-core';

const getArtifactPath = (filename: string) =>
  path.join(process.env.ARTIFACT_DIRECTORY ?? './test-results', filename);

export const saveDownloadAsArtifact = (download: Download) => {
  const downloadFilename = download.suggestedFilename() ?? `browser-download-${Date.now()}`;
  console.log(`Saving browser download as '${downloadFilename}' to test artefacts directory`);
  return download.saveAs(getArtifactPath(downloadFilename));
};
