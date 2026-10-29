---
name: chatbot-from-design
description: Apply a chatbots design from the form builder's Chatbots designer (the "Export for Claude" JSON) to a helpline's Lex V2 config in twilio-iac - the bots, intents, slots and slot_types JSON files under configs/lex_v2 - and run a plan of the lex stage. Use when asked to apply, implement or update a helpline's chatbot, pre-survey or post-survey questions, messages or answers from a chatbots design.
---

# Chatbots from a chatbots design

Turns a helpline's chatbots design (form builder › **Chatbots**, see
[form-builder/docs/chatbot-designer.md](../../../form-builder/docs/chatbot-designer.md)) into its
Lex V2 config files in `twilio-iac`, then shows a plan of the `lex` stage.

## Hard rules

- **Only implement chatbots marked "Ready for Claude"** (`bots[].status` is `ready` in the export).
  If the one you're asked about is `in-progress`, `imported` or `implemented`, say so and ask before
  going on: the team may still be changing it. After implementing, remind the person to mark it
  **Implemented** in the designer (you can't change the design).
- **Never** run `apply`, `destroy`, `import` or state commands. Read-only `plan` is fine; the person
  applies.
- Staging first; production only when the person says so.
- **Never edit a shared file** (`twilio-iac/helplines/configs/lex_v2/...`): other helplines use it.
  Each change has a `writeTo`: for a shared file it's a copy of the helpline's own
  (`<code>/configs/lex_v2/<language>/<kind>/<name>.json`), which the lex stage finds first. Copy the
  shared file there, then change the copy.
- **Answers made in the designer are always the helpline's own slot types**, in
  `<code>/configs/lex_v2/<language>/slot_types/<name>.json` (like `usch/configs/lex_v2/en_USCH/slot_types/`),
  never in the shared `configs/lex_v2` folders or the helpline's `common` folder, even when the name is
  generic. `writeTo` already says so.
- Notes and comments in the design (`notes`, `comments` on a chatbot, question, answer list or
  answer) are the team's context: read them, mention the open ones that affect the work, but build
  what the design says. Never write them into the Lex files.
- Renaming a question's slot (`slot`) changes the name its answer is saved under: anything reading
  it (Studio flows, `captureChannelWithBot` / post-survey lambdas, Insights mappings, form
  definitions' `PrepopulateMappings.json`) must change too. Find those references and ask first.
- Don't invent alias ids; the repo is public.

## How Lex reads the files

The lex stage (`twilio-iac/stages/lex/terragrunt.hcl`, explained in its README) loads, for each
language in `lex_v2_bot_languages` (common.hcl / the environment's file) and each bot:

| File | What Lex takes from it |
|---|---|
| `bots/<bot>.json` | The bot's settings and its intents, with each intent's questions in order (`slot_priorities`: `slot_name`, `slot_type_name`). Its texts (`slot_question`, `failure_response`, `initial_response`, `closing_response`) are **not** what Lex says, but keep them the same as the slots/intents files so people reading it aren't misled |
| `intents/<intent>.json` | `sampleUtterances` (what starts it), `initialResponseSetting` (the greeting), `intentClosingSetting` (the goodbye), `slotPriorities` (the questions' order) |
| `slots/<slot>.json` | `slotTypeName`, `valueElicitationSetting.promptSpecification.messageGroups` (the question), `maxRetries`, `slotConstraint` (`Required`/`Optional`), `slotCaptureSetting.failureResponse` (said when it gives up) and `captureNextStep` (`ElicitSlot` with `slotToElicit` = the next question; `FulfillIntent` after the last) |
| `slot_types/<type>.json` | `slotTypeValues`: each `sampleValue.value` (what's saved) and its `synonyms`; `valueSelectionSetting`; `parentSlotTypeSignature` (for patterns) |

Each is looked up in order: `<code>/configs/lex_v2/<language>/`, `<code>/configs/lex_v2/common/`,
`configs/lex_v2/<language>/`, `configs/lex_v2/<first two letters of language>/`. `AMAZON.*` slot
types are Lex's own (no file).

Files are found **by name within a language folder**: two chatbots in the same language share
`intents/<name>.json` and `slots/<name>.json` when the names are the same. The designer names a
copied chatbot's intents after it and flags two different questions saved under the same name; keep
it that way.

### The three kinds of answers

| Kind in the design | What to write |
|---|---|
| A list (`values`) | `slot_types/<name>.json`: `slotTypeName`, `slotTypeValues` (`sampleValue.value` + `synonyms[].value`), `valueSelectionSetting.resolutionStrategy` `TopResolution` (copy the rest from one of the helpline's lists) |
| A pattern (`pattern`, `parent: "AMAZON.AlphaNumeric"`) | `slot_types/<name>.json` like USNM's `zip_code.json`: `"slotTypeValues": []`, `"parentSlotTypeSignature": "AMAZON.AlphaNumeric"`, `"valueSelectionSetting": { "resolutionStrategy": "TopResolution", "regexFilter": { "pattern": "<pattern>" } }`. Lex only takes letters, digits, `[classes]` and bounded repeats (no `*`, `+`, `{n,}` or `.`), up to 300 characters, and keeps at most 30 characters of the answer |
| Lex's own (`builtin`, `AMAZON.*`) | No file: the slot's `slotTypeName` is the `AMAZON.` name. `AMAZON.UKPostalCode` is en_GB only |

## The export

`<helpline>-chatbots.json`:

| Field | What it is |
|---|---|
| `helpline` | The helpline code |
| `changes[]` | What changed since the import: `bot` (`<language>/<bot>`), `what`, `file` (where it's read from today), `writeTo` (where to write it), `alsoInBotsFile` (the bots file to keep the same), `from`, `to` |
| `design.bots[]` | Every chatbot as it should be: intents with `utterances`, `opening`, `closing`, `questions[]` (`slot`, `answerType`, `question`, `failureMessage`, `retries`, `required`, `file`) |
| `design.answerTypes` | By language, each answer list: `values[]` (`value`, `synonyms`), `pattern`, `parent`, `builtin`, `file` |
| `design.formMappings` | Contact form fields each answer fills in (by slot name), as lists of "first of" lists; `design.formsVersion` is the form definitions version |
| `bots[]` | Each chatbot's `status` (`imported`, `in-progress`, `ready`, `implemented`) and `isNew` |
| `checks` | What the designer found (errors first) |

## Workflow

1. **Read the export.** Check `schemaVersion` is 1. Tell the person the helpline, each change in
   plain words, and the `checks` errors. Errors are fixed in the designer, not here: stop.
2. **For each change**, edit `writeTo` (copying the shared file first when `writeTo` isn't `file`):
   - `opening message` / `closing message`: the `plainTextMessage.value` in
     `initialResponseSetting.initialResponse.messageGroups[0]` / `intentClosingSetting.closingResponse.messageGroups[0]`
     (add the setting, copying another intent's, when there was none). Same text in the bots file's
     `initial_response.message` / `closing_response.message`.
   - `starts when (utterances)`: `sampleUtterances` in the intent file and `utterances` in the bots file.
   - `question “<slot>”: <field>`: in the slot file: `question` → the prompt message;
     `failureMessage` → `slotCaptureSetting.failureResponse`; `retries` → `maxRetries` (and the
     `promptAttemptsSpecification` `RetryN` entries: one per retry, copied from `Retry1`);
     `required` → `slotConstraint`; `answerType` → `slotTypeName`. Mirror question/failure texts and
     the type in the bots file's `slot_priorities` entry.
   - `new question`: a new slot file, copied from one of the helpline's slots (same `intentName`),
     with `slotName`, `slotTypeName`, texts and `description` set. Add it to the intent's
     `slotPriorities` and the bots file's `slot_priorities` in place.
   - `questions and their order`: renumber `slotPriorities` (intent) and `slot_priorities` (bots
     file) in the new order, and fix every slot's `captureNextStep`: `ElicitSlot` +
     `slotToElicit: <next slot>`, and `FulfillIntent` (no `slotToElicit`) for the last one.
   - `question removed`: take it out of both priorities lists and the chain; leave the slot file
     unless nothing else uses it (another intent or helpline might).
   - `answers “<type>”` / `new answers`: write `slotTypeValues` from `to.values` (keep
     `valueSelectionSetting`; for a new type copy it from a similar one). A pattern (`to.pattern`)
     is written as in "The three kinds of answers" above.
   - `contact form fields filled in by “<slot>”`: in the form definitions' `PrepopulateMappings.json`
     (`writeTo`, under `lambdas/packages/hrm-form-definitions/form-definitions/`), set `survey.<slot>`
     to `to` (a string, a list, or a list of lists exactly as given), or remove the key when `to` is
     absent. Never touch `formSelector` or `preEngagement` there (they're edited in the Forms area).
     Then run that package's checks: `cd lambdas/packages/hrm-form-definitions && npm test`. A
     dropdown field only takes answers that are one of its options (else Unknown): the designer
     warns about those; mention the warnings.
   - `new chatbot` / `new intent`: read its `notes` (what it's for, how it starts), and ask the
     person anything missing about how it's started (which Studio flow or channel). Build its
     bots/intents/slots files following the helpline's existing ones (`locale` is the Lex locale),
     and add it to `lex_v2_bot_languages` in the environment files it should be in (staging first).
3. **Check** the JSON parses and the chain is right:
   ```bash
   cd form-builder && npx vitest run server/chatbots.test.ts   # imports every helpline's chatbots
   ```
   and re-read each changed file. Show `git diff` and explain it in plain words.
4. **Plan (staging)** on the devops node (stages at `~/flex-plugins.git/twilio-iac/stages`), on
   the branch with these changes pushed:
   ```bash
   cd ~/flex-plugins.git/twilio-iac/stages/lex && make HL=<code> HL_ENV=staging plan
   ```
   Read it back: which bots, intents, slots and slot types change, and that nothing else does.

## Hand-off

End with the files changed, what the plan shows, and what's left for the person: apply, open the
PR, test the chatbot in staging (a webchat or SMS contact that goes through it), then production
when they're ready, and mark the chatbot **Implemented** in the designer. If a question was renamed
or added, remind them to check where its answer is read (Studio flows, Insights, prepopulate
mappings).
