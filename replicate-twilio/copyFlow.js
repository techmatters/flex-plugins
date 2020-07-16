const fs = require("fs").promises;

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

  var newFlow;
  if (flowFile != null) {
    const flowStr = await fs.readFile(flowFile, "utf8");
    const flowData = JSON.parse(flowStr);
    newFlow = recReplaceIds(flowData, oldIds);
  } else {
    var oldFlow;
    try {
      oldFlow = await client.studio.flows(oldIds["Flow_To_Copy"]).fetch();
    } catch (err) {
      console.log(err);
    }
    newFlow = recReplaceIds(oldFlow, oldIds);
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
  for (var i = 0; i < keysToRemove.length; i++) {
    delete newFlow[keysToRemove[i]];
  }

  newFlow["status"] = "draft";
  newFlow["commitMessage"] = "Copied flow.";

  const newIdStr = await fs.readFile(newIdsFile, "utf8");
  const newIds = JSON.parse(newIdStr);
  const newAccountSid = newIds["AccountSid"];
  const newAuthToken = newIds["AuthToken"];
  const newClient = require("twilio")(newAccountSid, newAuthToken);

  newFlow = recReplaceKeyTags(newFlow, newIds);

  if (update) {
    newClient.studio
      .flows(newIds["Flow_To_Update"])
      .update(newFlow)
      .then((f) => console.log("Done! Flow " + f.sid + " has been updated."));
  } else {
    newClient.studio.flows
      .create(newFlow)
      .then((f) => console.log("Done! Flow published as " + f.sid));
  }
}

function recReplaceIds(flow, idDict) {
  var keys = Object.keys(flow);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    // Don't copy hidden values
    if (key.indexOf("_") == 0) {
      continue;
    }

    var val = flow[key];
    // Recurse on nodes with children
    if (typeof val === "object") {
      val = recReplaceIds(val, idDict);
    } else if (typeof val === "string") {
      // Currently hardcorded to find sids, Workspaces, and TaskChannels
      if (
        key.indexOf("id") !== -1 ||
        val.indexOf("WW") === 0 ||
        val.indexOf("TC") === 0
      ) {
        var idName = getKeyByValue(idDict, val);

        if (idName == null) {
          console.log(
            "ERROR: The id " + val + " is not present in the fromId file."
          );
          process.exit(0);
        } else {
          val = "<<" + idName + ">>";
        }
      }
    }
    flow[key] = val;
  }

  return flow;
}

// Requires each value to be unique
function getKeyByValue(jsonDict, val) {
  var keys = Object.keys(jsonDict);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (jsonDict[key] === val) {
      return key;
    }
  }

  return null;
}

function recReplaceKeyTags(flow, idDict) {
  var keys = Object.keys(flow);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    // Ignore hidden values
    if (key.indexOf("_") == 0) {
      continue;
    }

    var val = flow[key];

    // Recurse on nodes with children
    if (typeof val === "object") {
      val = recReplaceKeyTags(val, idDict);
    } else if (typeof val === "string") {
      if (val.indexOf("<<") === 0) {
        flow[key] = idDict[val.replace(/[<>]/g, "")];
      }
    }
  }

  return flow;
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
