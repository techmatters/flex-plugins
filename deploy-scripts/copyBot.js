const fs = require("fs").promises;

async function setUpTasks(clientFn, newClientFn) {
  const taskList = await clientFn.list();
  await Promise.all(
    taskList.map(async (task) => {
      // The task actions need to be gotten separately
      const actions = clientFn(task.sid).taskActions().fetch();

      // Create a copy of this task
      const newTask = await newClientFn.create({
        friendlyName: task.friendlyName,
        uniqueName: task.uniqueName,
        actions: actions.data,
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

      // SYNCHRONIZING ISSUES IS HERE ////////////////////////////////////
      fieldValues.forEach(async (v) => {
        await newClientFn(newField.sid).fieldValues.create({
          language: v.language,
          value: v.value,
          synonymOf: v.synonymOf,
        });
      });
    })
  );
}

async function copyAssitant() {
  const file = await fs.readFile("staging.json", "utf8");
  const ids = JSON.parse(file);
  const accountSid = ids.AccountSid;
  const authToken = ids.AuthToken;
  // eslint-disable-next-line global-require
  const client = require("twilio")(accountSid, authToken);

  const newFile = await fs.readFile("prod.json", "utf8");
  const newIds = JSON.parse(newFile);
  const newSid = newIds.AccountSid;
  const newAuthToken = newIds.AuthToken;
  // eslint-disable-next-line global-require
  const newClient = require("twilio")(newSid, newAuthToken);

  const botId = ids.Bot_To_Copy;

  const bot = await client.autopilot.assistants(botId).fetch();
  const newBot = await newClient.autopilot.assistants.create({
    friendlyName: bot.friendlyName,
    uniqueName: "", // PICK A NAME AND INSERT IT HERE, NEEDS TO BE SOMETHING THAT ISN'T BEING USED
  });
  const newBotId = newBot.sid;

  await setUpTasks(
    client.autopilot.assistants(botId).tasks,
    newClient.autopilot.assistants(newBotId).tasks
  );

  await setUpFieldTypes(
    client.autopilot.assistants(botId).fieldTypes,
    newClient.autopilot.assistants(newBotId).fieldTypes
  );
}

copyAssitant();
