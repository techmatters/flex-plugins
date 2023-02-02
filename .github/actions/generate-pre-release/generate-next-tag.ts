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

import { setOutput, setFailed } from '@actions/core';

async function generateNextTag() {
  const prefix = process.env.PREFIX;
  const latestTag = process.env.LATEST_MATCHING_TAG;

  // If no latest tag found, return this as the first iteration for this prefix
  if (!latestTag) {
    const generatedTag = `${prefix}.1`
    return generatedTag;
  }

  // Strip the prefix and the dot (e.g. vX.Y.Z-qa.3)
  const latestIteration = parseInt(latestTag.slice(prefix.length + 1), 10);

  if (isNaN(latestIteration)) {
    throw new Error(`latestTag ${latestTag} could not be processed when trying to strip latestIteration`);
  }

  const nextIteration = latestIteration + 1;
  const generatedTag = `${prefix}.${nextIteration}`;
  return generatedTag;
}

generateNextTag()
.then((generatedTag) => {
  console.log(`Generated next tag: ${generatedTag}`);
  setOutput('generated-tag', generatedTag);
})
.catch((err) => {
  console.log(err);
  setFailed(err.message);
});
