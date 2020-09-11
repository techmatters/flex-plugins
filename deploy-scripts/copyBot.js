const fs = require("fs").promises;
const { replaceIncidence } = require("./helpers");

async function setUpTasks(clientFn, newClientFn, fromIds, toIds) {
  const taskList = await clientFn.list();
  await Promise.all(
    taskList.map(async (task) => {
      // The task actions need to be gotten separately
      const taskActions = await clientFn(task.sid).taskActions().fetch();
      const actions = JSON.parse(
        replaceIncidence(fromIds, toIds, JSON.stringify(taskActions.data))
      );

      // Create a copy of this task
      const newTask = await newClientFn.create({
        friendlyName: task.friendlyName,
        uniqueName: task.uniqueName,
        actions,
      });

      // Now that we have our Task, add in all the samples
      const samples = await clientFn(task.sid).samples.list();
      samples.forEach(async (s) => {
        await newClientFn(newTask.sid).samples.create({
          language: s.language,
          taggedText: s.taggedText,
        });
      });
    })
  );
}

async function setUpFieldTypes(clientFn, newClientFn) {
  const fieldList = await clientFn.list();
  await Promise.all(
    fieldList.map(async (field) => {
      // Create a copy of this field type
      const newField = await newClientFn.create({
        friendlyName: field.friendlyName,
        uniqueName: field.uniqueName,
      });

      let fieldValues = await clientFn(field.sid).fieldValues.list();
      // Need to reverse because some words are synonyms of a word after it
      fieldValues = fieldValues.reverse();

      await fieldValues.reduce(async (previousPromise, v) => {
        await previousPromise;
        return newClientFn(newField.sid).fieldValues.create({
          language: v.language,
          value: v.value,
          synonymOf: v.synonymOf,
        });
      }, Promise.resolve());
    })
  );
}

async function copyAssitant(oldIdsFile, newIdsFile) {
  const file = await fs.readFile(oldIdsFile, "utf8");
  const fromIds = JSON.parse(file);
  const accountSid = fromIds.AccountSid;
  const authToken = fromIds.AuthToken;
  // eslint-disable-next-line global-require
  const client = require("twilio")(accountSid, authToken);

  const newFile = await fs.readFile(newIdsFile, "utf8");
  const toIds = JSON.parse(newFile);

  const newSid = toIds.AccountSid;
  const newAuthToken = toIds.AuthToken;
  // eslint-disable-next-line global-require
  const newClient = require("twilio")(newSid, newAuthToken);

  const botId = fromIds.Bot_To_Copy;
  const fromBot = client.autopilot.assistants(botId);
  const bot = await fromBot.fetch();

  const newBot = await newClient.autopilot.assistants.create({
    friendlyName: bot.friendlyName,
    uniqueName: bot.uniqueName, // IF YOU GET AN ERROR THAT IT ALREADY EXISTS, JUST PUT ANOTHER STRING IN HERE
  });
  const newBotId = newBot.sid;
  const toBot = newClient.autopilot.assistants(newBotId);

  await setUpTasks(fromBot.tasks, toBot.tasks, fromIds, toIds);

  await setUpFieldTypes(fromBot.fieldTypes, toBot.fieldTypes);

  const defaults = (await bot.defaults().get().fetch()).data;
  await toBot.defaults().update({ defaults });
}

// eslint-disable-next-line import/order
const { argv } = require("yargs")
  .usage("npm run copyBot -- --fromIds {file} --toIds {file}")
  .alias("f", "fromIds")
  .alias("t", "toIds")
  .describe(
    "f",
    "JSON filename with original account SIDs. To copy a bot on Twilio, " +
      "this file must have the key 'Bot_to_Copy' with a value of the bot's " +
      "SID."
  )
  .describe(
    "t",
    "JSON filename with SIDs of the account being copied to. The key names have " +
      "no required format, but corresponding SIDs must have the same keys " +
      "across the two files."
  )
  .demandOption(["fromIds", "toIds"]);

copyAssitant(argv.fromIds, argv.toIds);
