/* eslint-disable no-console */
const fs = require("fs").promises;

const oldIdDict = {};
const newIdDict = {};

/**
 * Compares lists of JSON objects and creates or updates objects in the new
 * account to match those of the original
 * @param {*} orig The original list of objects
 * @param {*} copy The new list of objects
 * @param {*} prefix The prefix to use when saving SIDs (should be unique to the call)
 * @param {*} props A list of key names to copy from the original objects
 * @param {*} baseFn The function to call 'create' or 'update' on
 */
async function createMatchingList(orig, copy, prefix, props, baseFn) {
  await Promise.all(
    orig.map(async (obj) => {
      const newConfig = Object.fromEntries(
        Object.keys(obj)
          .filter((key) => props.includes(key))
          .map((key) => [key, obj[key]])
      );

      // Might need to add something where IDs are copied

      const friendlyN = obj.friendlyName;
      let newObj = copy.find((e) => e.friendlyName === friendlyN);

      if (newObj == null) {
        newConfig.friendlyName = friendlyN;
        newObj = await baseFn.create(newConfig);
      } else {
        await baseFn(newObj.sid).update(newConfig);
      }

      oldIdDict[prefix + friendlyN] = obj.sid;
      newIdDict[prefix + friendlyN] = newObj.sid;
    })
  );
}

/**
 * Copies the Workspaces, TaskChannels, and Activities of the staging account to
 * a new account.
 * @param {*} newAccSid The SID of the account to copy to.
 * @param {*} newAccAuth The authentication token of the account to copy to.
 */
async function setUpTaskRouter(newAccSid, newAccAuth) {
  // eslint-disable-next-line global-require
  const newClient = require("twilio")(newAccSid, newAccAuth);
  let client;
  try {
    const flowStr = await fs.readFile("staging.json", "utf8");
    const vals = JSON.parse(flowStr);
    // eslint-disable-next-line global-require
    client = require("twilio")(vals.AccountSid, vals.AuthToken);
  } catch (err) {
    console.log(err);
    console.log(
      "ERROR: This script requires a file 'staging.json' with the SID " +
        "and auth token of the account you wish to copy the workspaces of."
    );
    return;
  }

  // Make the workspaces
  const oldWSes = await client.taskrouter.workspaces.list();
  await Promise.all(
    oldWSes.map(async (oldWS) => {
      const friendlyN = oldWS.friendlyName;
      oldIdDict[`WS_${friendlyN}`] = oldWS.sid;
      const newWS = await newClient.taskrouter.workspaces.create({
        friendlyName: friendlyN,
        template: oldWS.prioritizeQueueOrder === "FIFO" ? "FIFO" : "NONE",
      });
      newIdDict[`WS_${friendlyN}`] = newWS.sid;
    })
  );

  // Now create the structure within the workspace
  const wsNames = Object.keys(oldIdDict);
  try {
    await Promise.all(
      wsNames.map(async (wsName) => {
        const [oldTCs, newTCs, oldWAs, newWAs] = await Promise.all([
          client.taskrouter.workspaces(oldIdDict[wsName]).taskChannels.list(),
          newClient.taskrouter
            .workspaces(newIdDict[wsName])
            .taskChannels.list(),
          client.taskrouter.workspaces(oldIdDict[wsName]).activities.list(),
          newClient.taskrouter.workspaces(newIdDict[wsName]).activities.list(),
        ]);

        await Promise.all([
          createMatchingList(
            oldTCs,
            newTCs,
            "TC_",
            ["uniqueName", "channelOptimizedRouting"],
            newClient.taskrouter.workspaces(newIdDict[wsName]).taskChannels
          ),
          createMatchingList(
            oldWAs,
            newWAs,
            "WA_",
            ["available"],
            newClient.taskrouter.workspaces(newIdDict[wsName]).activities
          ),
        ]);
      })
    );
  } catch (err) {
    // Rollback changes if script fails partway
    console.log(err);
    console.log("Workspace set-up failed. Deleting workspaces created.");
    await Promise.all(
      wsNames.map(async (wsName) =>
        newClient.taskrouter.workspaces(newIdDict[wsName]).remove()
      )
    );
  }
}

const { argv } = require("yargs")
  .usage(
    "npm run configure -- --sid={SID} --authToken={token} [--delete={workspace SID}]"
  )
  .alias("s", "sid")
  .alias("a", "authToken")
  .alias("d", "delete")
  .describe("sid", "SID of the account to set up.")
  .describe("authToken", "Authentication token of the account to set up.")
  .describe(
    "delete",
    "Optional. Switches script into delete mode and deletes the given workspace."
  )
  .demandOption(["sid", "authToken"]);

if (argv.delete) {
  // eslint-disable-next-line global-require
  const client = require("twilio")(argv.sid, argv.authToken);
  client.taskrouter
    .workspaces(argv.delete)
    .remove()
    .then(
      // eslint-disable-next-line no-unused-vars
      (_) => console.log("Workspace deleted."),
      (err) => console.log(err)
    );
} else {
  setUpTaskRouter(argv.sid, argv.authToken).then(
    // eslint-disable-next-line no-unused-vars
    (_) => console.log("Workspace set-up complete."),
    (err) => console.log(err)
  );
}
