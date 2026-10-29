# Chatbot designer: design

A **Chatbots** section in the form builder that shows a helpline's chatbots (Amazon Lex V2: the
pre-surveys, post-surveys, language selectors...) as conversations anyone can read: what starts
them, what they say, each question with the answers they understand, and what happens when an
answer isn't understood. A phone preview plays the conversation. Changes are exported for a Claude
skill that writes them into `twilio-iac` and runs a plan.

**Status:** built: start page, import or start from scratch, new chatbots, conversation editor,
answers (lists, patterns, Lex's own), contact form fields, notes and comments, statuses, phone
preview, check, export, skill `chatbot-from-design`. Helpline staff see their helpline's chatbots;
for now only Aselo staff change them.

## How chatbots are configured today

Each helpline lists its bots per language in `lex_v2_bot_languages` (common.hcl or an
environment's file), e.g. `en_USCH : ["pre_survey", "post_survey"]`. The lex stage
(`twilio-iac/stages/lex`) reads four kinds of JSON file under `configs/lex_v2/<language>/`, from
the helpline's folder first, then its `common` folder, then the shared `configs/lex_v2/<language>`
and `configs/lex_v2/<first two letters>`:

| File | What it holds | In the designer |
|---|---|---|
| `bots/<bot>.json` | The bot's settings and its intents, with their questions in order | A chatbot in the list (name, language, where it's live) |
| `intents/<intent>.json` | What starts it (utterances), the greeting, the goodbye, the questions' order | "Starts when…" chips, Greeting and Goodbye bubbles; a bot with several intents (post-survey Yes / No) shows one tab per path ("When they answer “Yes”") |
| `slots/<slot>.json` | One question: its text, how many times it asks again, what it says when it gives up, the next question | A numbered question card: the question bubble, "Saved as" (the slot name), Required, "Not understood: asks again N times, then says…" |
| `slot_types/<type>.json` | The answers it understands and the other ways of saying each | Answer chips on each question (with how many other ways), and the **Answers** tab to edit them |

`bots/<bot>.json` repeats the texts (`slot_question`...), but Lex says what's in the intents and
slots files. The import shows Lex's and lists where the two differ (several helplines have
drifted, e.g. NZ, ZM, USNM's Spanish post-survey).

## The start page

Every chatbot this person can see, across helplines, as a table: helpline, chatbot, language,
questions, **status**, where it's live, last change. Filter by status. Opening a helpline with no
design yet lets Aselo staff **import** its chatbots from the live config or **start from scratch**.

## Status

Each chatbot has a status, the same as boards and routing designs (src/designStatus.ts):
**Imported** (as live, unchanged) → **In progress** → **Ready for Claude** → **Implemented**, and a
**New** tag when it isn't in the live config. Changing what a chatbot says or asks, the answers its
questions take or the form fields they fill in sets it back to In progress; notes and comments
don't. Aselo staff set Ready / Implemented. The export lists each chatbot's status, and the skill
only implements the ready ones.

## The editor

- **Chatbots** (left): each bot with its language, number of questions, where it's live and its
  status; **New chatbot** (Aselo staff): a name (as Lex calls it), the language (configs folder),
  the Lex locale, and empty or a copy of another (into another language, its answers come along;
  in the same language its intents are renamed after it, as intents and slots are one file per name
  in a language folder).
- **About this chatbot**: notes (what it's for, who it talks to, how it starts) and comments.
- **Conversation**: a timeline from "Starts when" to "Goodbye", texts edited in place (the boxes
  grow with the paragraph), questions moved up/down, added and removed. Each question shows:
  - **Answers**: a list, a pattern or one of Lex's own types (see below), chosen or created there
    (named after the question by default).
  - **Fills in on the contact form** (chatbots before the counselor): the contact form fields its
    answer fills in, picked from the helpline's forms (`ChildInformationTab.age`), with a warning
    when a dropdown field has no option for some of the answers (they'd be saved as Unknown).
  - Comments, and its check problems.
- **Phone preview** (right): plays the conversation with the answers as they're saved (the value,
  not the other ways of saying it). Tap an answer, or type one: a typed answer is understood if it's
  one of the list's (or its other ways), matches the pattern, or for Lex's own types anything.
  "Something it doesn't understand" shows the retry and, after the last one, the give-up message.
  At the end it lists what was saved for the counselor.
- **Answers**: by language, three kinds:
  - **Lists**: the answer saved and the other ways of saying it (a Lex slot type's values).
  - **Patterns**: anything matching a regular expression, e.g. a 5-digit zip code: a custom slot
    type whose parent is `AMAZON.AlphaNumeric`, with `valueSelectionSetting.regexFilter` (as USNM's
    `zip_code`). Ready-made patterns and a box to try answers. Lex takes letters, digits, `[classes]`
    and repeats with a maximum (no `*`, `+`, `{n,}` or `.`), up to 300 characters, and keeps up to 30
    characters of the answer.
  - **Lex's own** (`AMAZON.State`, `AMAZON.Number`, `AMAZON.Date`...): what each understands and
    saves. No file.
  Lists, patterns and each answer can carry comments. New ones are always written to the
  helpline's own folder (`<code>/configs/lex_v2/<language>/slot_types/`).
- **Check**: questions without text, answers not defined, the same words meaning two answers ("1"
  for both Yes and No), names Lex won't take, two chatbots or questions that would share a file,
  patterns Lex won't take, Lex types not in the chatbot's locale, no goodbye, no give-up message,
  unused answer lists, and contact form fields that don't exist, aren't asked, or would get Unknown.

## Contact form fields (PrepopulateMappings.json)

When a contact reaches a counselor, the `populateHrmContactFormFromTaskByMappings` lambda copies
the chatbot's answers (task attribute `memory`, by slot name) into the contact form, following the
`survey` part of the helpline's form definitions `PrepopulateMappings.json`, on the tabs its form
selector picks (Forms › **Filling in the contact**). The designer reads that file at import (the
version in the helpline's `definitionVersion`), keeps the mappings with the design, and exports
changes to it for the skill. A dropdown field only takes an answer that is one of its options
(ignoring case), else its Unknown option; `age` is matched as a number. Only when the helpline's
`use_prepopulate_mappings` flag is on (else the older PrepopulateKeys.json is used).

## Storage, access and output

One design per helpline, `chatbots/<code>.json` in the drafts bucket (saved automatically, with the
"someone else changed it" check), keeping a copy of what was imported so changes can be listed.
**Export for Claude** (Aselo staff) downloads `<code>-chatbots.json`: the changes file by file
(`writeTo` is where to write; a shared file's change goes to a copy of the helpline's own), the
design, and the checks. The skill **chatbot-from-design** applies it and runs
`stages/lex` `make plan` for staging.

## Not built yet

- Choosing which Studio flow starts a new chatbot (for now, write it in its notes).
- Showing which Studio flow and channel use each chatbot, and where else its answers go (task
  attributes, Insights), so renaming a question shows what it affects.
- Comments by helpline staff (only Aselo staff save designs for now).
- Branching (Lex conditions on answers): today's chatbots are linear, and so is the designer.
- Translations side by side (the same bot in each language).
- "Ready to implement" (Claude reading the design from the builder), as for Contact flows.

## Importing from a branch

Imports read master (deployed; locally, this checkout) unless another flex-plugins branch is chosen
next to the import button, e.g. the branch a helpline's changes are being made in. The branch's
files are downloaded from GitHub (public) and kept as a snapshot until it moves on
(server/branches.ts); the preview says which branch and commit it read, and chatbot and routing
designs keep it as `importedFrom`.
