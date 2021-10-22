/* eslint-disable no-console */
const fs = require('fs').promises;
// @ts-ignore
const Confirm = require('prompt-confirm');

/**
 * Recursively replaces the sids with those of the new account
 * @param {*} flow The flow to replace the ids of
 * @param {*} oldIdDict The ids of the flow's original account
 * @param {*} newIdDict The ids of the account that the flow will be copied to
 */
// @ts-ignore
function recReplaceIds(flow, oldIdDict, newIdDict) {
  // Handle cases where Object.keys will return non-empty for non-Objects
  if (typeof flow === 'string') return flow;
  if (Array.isArray(flow)) return flow.map((e) => recReplaceIds(e, oldIdDict, newIdDict));

  const keys = Object.keys(flow);
  const idKeys = Object.keys(oldIdDict);

  const newFlow = Object.fromEntries(
    keys
      .filter((key) => key.indexOf('_') !== 0) // Remove hidden values
      .map((key) => {
        let val = flow[key];
        if (typeof val === 'object') {
          val = recReplaceIds(val, oldIdDict, newIdDict);
        } else if (typeof val === 'string') {
          // Currently hardcorded to find sids, Workspaces, and TaskChannels
          if (key.indexOf('id') !== -1 || val.indexOf('WW') === 0 || val.indexOf('TC') === 0) {
            if (val !== 'default') {
              const idName = idKeys.find((idKey) => oldIdDict[idKey] === val);

              if (idName == null) {
                throw new Error(
                  `The flow being copied refers to a value ${val}, ` +
                    'but no key with such a value is present in the fromIds file. ' +
                    'Please add a key-value pair for this value to fromIds, and an analogous one ' +
                    'to the toIds file, with the value to be used in the new flow.',
                );
              } else {
                val = newIdDict[idName];
              }
            }
          }
        }
        return [key, val];
      }),
  );

  return newFlow;
}

/**
 * Copies the structure of a studio flow from one account and posts it, with
 * functional SIDS, to a new account.
 * @param {import('./index').SourceInput} oldIds - The relative path to the sids of the original account
 * @param {import('./index').DestinationInput} newIds - The relative path to the sids of the new account
 * @param {string | null} flowFile - Optional string of a JSON file of the flow to copy
 * @param {boolean} update - Whether to update a flow or create a new one
 */
export async function copyAndPostFlow(oldIds, newIds, flowFile = null, update = false) {
  // eslint-disable-next-line global-require
  const client = require('twilio')(oldIds.AccountSid, oldIds.AuthToken);

  /**
   * @type {import("twilio/lib/rest/studio/v2/flow").FlowInstance}
   */
  let toCopy;
  if (flowFile != null) {
    const flowStr = await fs.readFile(flowFile, 'utf8');
    toCopy = JSON.parse(flowStr);
  } else {
    toCopy = await client.studio.flows(oldIds.Flow_To_Copy).fetch();
  }

  // Delete keys with account and editing information about old flow
  const keysToRemove = [
    'sid',
    'accountSid',
    'revision',
    'dateCreated',
    'dateUpdated',
    'webhookUrl',
    'url',
    'links',
  ];
  // @ts-ignore
  keysToRemove.forEach((key) => delete toCopy[key]);

  // eslint-disable-next-line global-require
  const newClient = require('twilio')(newIds.AccountSid, newIds.AuthToken);

  let newFlow;
  try {
    newFlow = recReplaceIds(toCopy, oldIds, newIds);
  } catch (err) {
    console.log(err);
    return;
  }

  newFlow.status = 'draft';
  newFlow.commitMessage = 'Copied flow.';

  const prompt = new Confirm('This studio flow will be posted. Continue?');

  const answer = await prompt.run();
  if (!answer) return;

  if (update && newIds.Flow_To_Update) {
    newClient.studio
      .flows(newIds.Flow_To_Update)
      .update(newFlow)
      .then(
        (f) => console.log(`Done! Flow ${f.sid} has been updated.`),
        (err) => console.log(err),
      );
  } else {
    newClient.studio.flows.create(newFlow).then(
      (f) => console.log(`Done! New flow draft created as ${f.sid}`),
      (err) => console.log(err),
    );
  }
}
