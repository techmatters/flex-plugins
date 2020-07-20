const fs = require("fs").promises;

/**
 * Copies the structure of a studio flow from one account and publishes it, with
 * functional SIDS, to a new account.
 * @param {string} oldIdsFile - The relative path to the sids of the original account
 * @param {string} newIdsFile - The relative path to the sids of the new account
 * @param {string} flowFile - Optional string of a JSON file of the flow to copy
 * @param {boolean} update - Whether to update a flow or create a new one
 */
async function copyAndPublishFlow(
  oldIdsFile,
  newIdsFile,
  flowFile,
  update = false
) {
  const oldIdStr = await fs.readFile(oldIdsFile, "utf8");
  const oldIds = JSON.parse(oldIdStr);
  const accountSid = oldIds["AccountSid"];
  const authToken = oldIds["AuthToken"];
  const client = require("twilio")(accountSid, authToken);

  var toCopy;
  if (flowFile != null) {
    const flowStr = await fs.readFile(flowFile, "utf8");
    toCopy = JSON.parse(flowStr);
  } else {
    toCopy = await client.studio.flows(oldIds["Flow_To_Copy"]).fetch();
  }

  // Delete keys with account and editing information about old flow
  const keysToRemove = [
    "sid",
    "accountSid",
    "revision",
    "dateCreated",
    "dateUpdated",
    "webhookUrl",
    "url",
    "links",
  ];
  keysToRemove.forEach((key) => delete toCopy[key]);

  const newIdStr = await fs.readFile(newIdsFile, "utf8");
  const newIds = JSON.parse(newIdStr);
  const newAccountSid = newIds["AccountSid"];
  const newAuthToken = newIds["AuthToken"];
  const newClient = require("twilio")(newAccountSid, newAuthToken);

  var newFlow = recReplaceIds(toCopy, oldIds, newIds);
  newFlow["status"] = "draft";
  newFlow["commitMessage"] = "Copied flow.";

  if (update) {
    newClient.studio
      .flows(newIds["Flow_To_Update"])
      .update(newFlow)
      .then(
        (f) => console.log("Done! Flow " + f.sid + " has been updated."),
        (err) => console.log(err)
      );
  } else {
    newClient.studio.flows.create(newFlow).then(
      (f) => console.log("Done! Flow published as " + f.sid),
      (err) => console.log(err)
    );
  }
}

/**
 * Recursively replaces the sids with those of the new account
 * @param {*} flow The flow to replace the ids of
 * @param {*} oldIdDict The ids of the flow's original account
 * @param {*} newIdDict The ids of the account that the flow will be copied to
 */
function recReplaceIds(flow, oldIdDict, newIdDict) {
  // Handle cases where Object.keys will return non-empty for non-Objects
  if (typeof flow == "string") return flow;
  if (Array.isArray(flow))
    return flow.map((e) => recReplaceIds(e, oldIdDict, newIdDict));

  var keys = Object.keys(flow);
  const idKeys = Object.keys(oldIdDict);

  const newFlow = Object.fromEntries(
    keys
      .filter((key) => key.indexOf("_") != 0) // Remove hidden values
      .map((key) => {
        var val = flow[key];
        if (typeof val === "object") {
          val = recReplaceIds(val, oldIdDict, newIdDict);
        } else if (typeof val === "string") {
          // Currently hardcorded to find sids, Workspaces, and TaskChannels
          if (
            key.indexOf("id") !== -1 ||
            val.indexOf("WW") === 0 ||
            val.indexOf("TC") === 0
          ) {
            if (val != "default") {
              var idName = idKeys.find((key) => oldIdDict[key] == val);

              if (idName == null) {
                console.log(
                  "ERROR: The id " + val + " is not present in the fromId file."
                );
                process.exit(0);
              } else {
                val = newIdDict[idName];
              }
            }
          }
        }
        return [key, val];
      })
  );

  return newFlow;
}

var argv = require("yargs")
  .usage(
    "npm run copy_flow -- --fromIds {file} --toIds {file} [--useFlow {file}] [--update]"
  )
  .alias("f", "fromIds")
  .alias("t", "toIds")
  .alias("u", "useFlow")
  .describe("f", "The JSON file of sids of the original account")
  .describe("t", "The JSON file of sids of the account being copied to")
  .describe("u", "Use a local JSON instead of a studio flow")
  .describe("update", "Update a flow instead of creating a new one")
  .boolean(["update"])
  .default("update", false)
  .demandOption(["fromIds", "toIds"]).argv;

copyAndPublishFlow(argv.fromIds, argv.toIds, argv.useFlow, argv.update);
