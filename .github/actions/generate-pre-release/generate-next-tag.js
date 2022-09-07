/**
 * If changes are made to this file, it needs to be recompiled using @vercel/ncc (https://github.com/vercel/ncc).
 * 1) Install vercel/ncc by running this command in your terminal. npm i -g @vercel/ncc
 * 2) Compile your index.js file. ncc build index.js --license licenses.txt
 * For details see https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action#commit-tag-and-push-your-action-to-github 
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
