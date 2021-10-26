/* eslint-disable no-console */
const fs = require('fs').promises;
const yargs = require('yargs');
const Confirm = require('prompt-confirm');
const { copyAndPostFlow } = require('./src/copyFlow/copyAndPostFlow');

/**
 * Copies the structure of a studio flow from one account and posts it, with
 * functional SIDS, to a new account.
 * @param {string} oldIdsFile - The relative path to the sids of the original account
 * @param {string} newIdsFile - The relative path to the sids of the new account
 * @param {string} flowFile - Optional string of a JSON file of the flow to copy
 * @param {boolean} update - Whether to update a flow or create a new one
 */
async function copyAndPostFlowFromFiles(oldIdsFile, newIdsFile, flowFile = null, update = false) {
  const prompt = new Confirm(
    'This is a deprecated script. Use the updated version instead. Are you sure you want to continue?',
  );

  const answer = await prompt.run();
  if (!answer) return;

  const oldIdStr = await fs.readFile(oldIdsFile, 'utf8');
  const oldIds = JSON.parse(oldIdStr);

  const newIdStr = await fs.readFile(newIdsFile, 'utf8');
  const newIds = JSON.parse(newIdStr);

  await copyAndPostFlow(oldIds, newIds, flowFile, update);
}

const { argv } = yargs
  .usage('npm run copyFlow -- --fromIds {file} --toIds {file} [--useFlow {file}] [--update]')
  .alias('f', 'fromIds')
  .alias('t', 'toIds')
  .alias('u', 'useFlow')
  .describe(
    'f',
    'JSON filename with original account SIDs. To copy a flow on Twilio, ' +
      "this file must have the key 'Flow_to_Copy' with a value of the flow's " +
      'SID.',
  )
  .describe(
    't',
    'JSON filename with SIDs of the account being copied to. The key names have ' +
      'no required format, but corresponding SIDs must have the same keys ' +
      'across the two files.',
  )
  .describe('u', 'Use a local JSON instead of a Twilio flow')
  .describe(
    'update',
    'Update an existing flow instead of creating one. There must be the key ' +
      "Flow_to_Update' in the toIds file with a value of the flow's SID.",
  )
  .boolean(['update'])
  .default('update', false)
  .demandOption(['fromIds', 'toIds']);

copyAndPostFlowFromFiles(argv.fromIds, argv.toIds, argv.useFlow, argv.update);
