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
