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
