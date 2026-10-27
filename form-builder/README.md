# Aselo Form Builder

A web app for helpline staff to configure their Aselo forms (contact forms, issue
categories, case sections and statuses) without editing JSON by hand.

It reads and writes the same files the Flex plugin uses:
`lambdas/packages/hrm-form-definitions/form-definitions/<helpline>/<version>/`.

- [docs/user-guide.md](docs/user-guide.md): how to use it, for helpline staff and Aselo staff
  (editing, submitting for review, reviewing and publishing).
- [docs/architecture.md](docs/architecture.md): how it works (each part, sign-in, permissions,
  future steps), with diagrams.
- [terraform/README.md](terraform/README.md): setting it up and deploying it.

## Status

**Phase 2: contact form editing.**

- The three contact form tabs (Caller, Child and Case information) can be edited:
  drag fields to reorder them or move them between columns, add fields, change questions,
  answers, required, hint text and PII.
- **Try it out** shows the edited contact form as counselors see it in Aselo: the same tabs
  (with the helpline's own tab names), two 217px columns, field styles, "Next" / "Save and
  End", and the same checks when saving. See `src/aselo/` — its styles are copied from
  `plugin-hrm-form` and name the plugin file each one comes from, so they can be kept in step.
  Text comes from the plugin's translation files plus the helpline's
  `customStrings/Substitutions.json`, in the helpline's language (`helplineLanguage` in its
  twilio-iac service configuration).
- Changes are saved as a draft on the server (see below) and checked as you go.
- **Review** lists the changes in plain language. Helpline staff submit them for review;
  Aselo staff apply them, or download a zip of the changed files laid out like the repo,
  plus a `CHANGES.md` for the reviewer.
- **Help boxes**: a field's description (the yellow box under it, with “see more”) is edited
  in its settings. Help boxes that use translation keys are shown in the helpline's language
  and edited as its own wording (`customStrings/Substitutions.json`); the rest stay in the form.
- **Linked dropdowns** (e.g. Province → Municipality → District, or a follow-up like
  "Experiencing abuse?" → "Risk level"), 2 to 5 levels: add them with a wizard, edit answers
  in a column browser, import from pasted spreadsheet cells, CSV or Excel, and download as
  Excel to edit offline. See "Linked dropdowns" below.
- **Chats and calls** sections, each with an Aselo preview next to the editor and in "Try it
  out": call type buttons (`CallTypeButtons.json`), canned responses
  (`CannedResponses.json`, shown only when `enable_canned_responses` is on) and the automatic
  chat and post-survey messages (`customStrings/Messages.json`,
  `customStrings/postSurveyMessages.json`). Existing "close without a form" call types are
  locked to Aselo staff, because contacts are saved with the button's text.
- **Webchat form** (`webchat/PreEngagementForm.json`) next to a working preview of the webchat
  (its window, texts, required questions and linked dropdowns, styled like
  `aselo-webchat-react-app`). Texts are edited per language: a question that uses a
  translation key keeps it and its text goes into the webchat's translations
  (`aselo-webchat-react-app/configSrc/<code>/translations/<locale>.json`); text written in the
  form stays in the form. The window title, introduction and start button are edited the same
  way. Changed webchat texts add a note for the reviewer, because the webchat has to be
  redeployed for them (the form itself is deployed with the form definitions). Each question
  can also fill in contact form fields, written to `PrepopulateMappings.json` (never the older
  `PrepopulateKeys.json`); helplines without `use_prepopulate_mappings` are told it only takes
  effect once that flag is on.
- **Issue categories** (`tabbedForms/IssueCategorizationTab.json`) next to the Aselo categories
  tab: add, reorder and colour categories and subcategories (one at a time or pasted one per
  line), help links for counselors, and how many can be chosen. Contacts and reports store the
  names, so existing names are renamed by Aselo staff only; removing asks first.
- **Cases**: each case section's form is edited with the same editor as the contact forms
  (with a preview of the section in Aselo); **Sections** adds, renames, orders and places them
  on the case (list or timeline), sets their heading and add button texts
  (`customStrings/Substitutions.json`) and the fields shown in their list; **Case statuses**
  edits names, colours, order and which status a case can move to, next to the status dropdown
  counselors get. Section keys and status values are what cases save, so they never change;
  existing sections are removed by Aselo staff only.
- **Service configuration** (Aselo staff only): the helpline's Flex service configuration
  (`twilio-iac/helplines/<code>/configs/service-configuration`), with the repo as the source of
  truth. Every setting (feature flags, attributes, Flex UI, other settings) shows what staging and
  production get and which file it comes from: Aselo's `defaults.json`, `common.json`, or the
  environment's file. They're merged as `manageServiceConfig.py` does: objects merge, lists add up,
  `null` removes. Filters: set by the helpline, all (including defaults), different between
  environments, changed in this draft. Each file's value is edited in place (on/off, text,
  number, or JSON), new settings are added with suggestions from the plugin's `FeatureFlags.ts`,
  and each file can be edited as JSON. `defaults.json` is read-only. The files travel in the
  draft as `service-configuration/<file>.json`. The API never sends them to helpline staff, and
  refuses them from helpline staff. Helpline staff saving or discarding a shared draft keeps
  Aselo staff's changes. The review lists each changed setting and the
  `make service-config-plan` / `service-config-apply` runs needed. It also warns about values
  that applying replaces (`serverless_base_url`) and about removals outside `attributes`, which
  applying doesn't remove from Twilio. The builder never applies anything to Twilio, and doesn't
  compare with what's live.
- **Features** (Aselo staff): switch client profiles, canned responses and
  `use_prepopulate_mappings` on or off, as a shortcut onto the service configuration: each switch
  is written in every file that already sets it, else in `common.json`. What counselors can do
  with cases is set by HRM permission rules, which the page names but doesn't change.
- **Client profiles** (`profileForms/`): profile sections (title, edit button, hint, height,
  personal data; names lock once they exist, existing ones are removed by Aselo staff only),
  the blocking options counselors choose from (name and length, in hours, days or weeks; each
  needs a different length because the plugin tells them apart by it), and, for Aselo staff,
  which profile details are personal data. Next to a sketch of the profile page.

### Drafts, roles and applying

- **Drafts** are saved on the server a moment after each edit: locally in
  `form-builder/drafts/<code>/<version>/` (gitignored); deployed, in a private versioned S3
  bucket. If someone else saved the same draft in between, saving stops and asks to reload.
- **Helpline staff** edit their own helplines' drafts and **submit them for review**, which
  notifies Aselo (deployed: a Slack message).
- **Aselo staff** also see settings that affect saved data (field names, PII on existing
  fields, switching an existing field's kind, renaming existing call types) and **apply**
  drafts. Locally, Apply writes the draft into this checkout for you to review with `git diff`
  and commit; deployed, it will open a PR through a GitHub App. Staff can tick "View as
  helpline staff" to see what helpline staff see.
- Roles come from Okta groups when deployed (`form-builder-<code>`, `form-builder-aselo-staff`).
  The API (`server/api.ts`) checks which helplines a person can open, that only Aselo staff
  apply, and that only Aselo staff see or change the service configuration.
- The other Aselo staff only edits (renaming existing fields, call types, categories, sections
  or statuses, PII on existing fields, switching an existing field's kind, removing required
  fields or existing sections) are enforced by the page only, not the API. This is a deliberate
  decision: only Aselo and helpline staff use the builder, someone calling the API directly
  would only be changing their own helpline's forms, and every draft is still reviewed by
  Aselo staff before it's applied. Checking these on the server is listed as a future
  improvement below.

### Rules that protect saved data

- A field's name is what contacts are saved under, so it's locked once the field exists.
  New fields get a camelCase name generated from the question.
- Relabelling an existing answer keeps its saved value; new answers are saved as their text.
- Fields the Aselo specification requires (`callSummary`, child `age` and `gender`) can't
  be removed where a helpline has them.
- Removing a field asks for confirmation and lists what else uses it (Insights reporting,
  pre-survey/pre-engagement prepopulation, linked dropdowns).
- Problems that already existed before the user's edits are reported as warnings for the
  reviewer, so they don't block export of unrelated changes.

### Linked dropdowns

Each level is its own field: a `select`, then `dependent-select` fields whose options are
grouped by the value chosen above (`options: { "<value above>": [...] }`).
`src/linkedDropdowns.ts` converts between that and a tree of answers.

- Lists are grouped by *value*, so two answers with the same value at a level with a level
  below would share one list (this happens in PH today: 112 municipality names repeat across
  provinces). New or imported answers that clash get a unique saved value such as
  "San Jose (Batangas)"; counselors still see "San Jose". Existing values are only changed
  by a spreadsheet import, which replaces the whole list.
- Lists already in `ReferenceData.json` stay there and stay shared with the other forms that
  use them (the editor says which). An inline list moves there when it grows past 200
  answers; lists that were already big inline are left alone.
- Saving unchanged answers leaves the files byte-for-byte identical (tested against every
  linked dropdown in the repo), and lists filed under values that no longer exist are kept
  unless an import replaces everything.
- Excel support uses SheetJS (installed from cdn.sheetjs.com, as the npm copy is outdated),
  loaded only when a spreadsheet is imported or downloaded.

Planned next:

1. Deployment at form-builder.tl.techmatters.org, in the management account: Okta login, S3 drafts, Apply through a GitHub App
   (branch + PR), Slack and email notifications, Terraform. Steps and status:
   [terraform/README.md](terraform/README.md)

Future improvements:

- Enforce the Aselo staff only edits on the server too: compare a helpline staff save with the
  current files and refuse changes the page wouldn't allow (see "Drafts, roles and applying").

Pending (found while building, in the definitions themselves):

- Duplicate field names. The plugin keeps one answer per name, so one of each pair is lost:
  `eumc/v1/caseForms/IncidentForm.json` (`specify`), `eumc/v1/caseForms/PerpetratorForm.json`
  (`specify`), `eumc/v1/caseForms/ReferralForm.json` (`otherorganisation`, `specify`),
  `zm/v1/caseForms/IncidentForm.json` (`incidentWitnessed`) and `nzba/v1/CallTypeButtons.json`
  (`hard`). Renaming needs Aselo staff, and a check of saved data and reporting.
- The builder shows these as warnings. Its case status warning for CA, MT and TZ (“closed”
  can move to “ongoing”) can be ignored: those helplines, like USNM, don't use cases.

## Running locally

```bash
cd form-builder
npm install
npm run dev
```

Open http://localhost:5180.

In development the app reads form definitions straight from this repo checkout. To
point it at a different checkout, set `FORM_DEFINITIONS_DIR` (and `WEBCHAT_CONFIG_DIR` for
the webchat's `configSrc`) before `npm run dev`.

Locally you're Aselo staff. To try it as helpline staff:

```bash
FORM_BUILDER_ROLE=helpline-staff FORM_BUILDER_HELPLINES=usnm npm run dev
```

## Checks

```bash
npm run typecheck   # TypeScript, including the shared form-definition types
npm test            # unit tests, plus every helpline loaded and validated, plus UI tests in jsdom
npm run build
```

## How it fits together

- `server/definitionsApi.ts` reads raw definition files for a helpline, and `server/api.ts`
  holds the routes. In development they're served by the Vite dev server
  (`server/devApiPlugin.ts`, with `server/localServices.ts`). Deployed, the same routes run in a
  Lambda (`server/lambda.ts`, built with `npm run build:lambda`), with:
  - the current files from flex-plugins master, which is public, so it's downloaded without
    credentials and kept until master moves on (`server/repoSnapshot.ts`, `server/publicRepo.ts`);
  - drafts in S3 (`server/s3DraftStore.ts`);
  - no Apply for now: Aselo staff download the changes and open the PR themselves, then discard
    the draft (see `terraform/README.md`). Apply through a GitHub App, opening a branch and PR
    with the review's change log as its description, is ready for later
    (`server/githubApplier.ts`, `server/github.ts`);
  - "submitted for review" posted to Slack (`server/slackNotifier.ts`). A failed notification
    doesn't stop the submission; it's logged.

  Who's signed in comes from the Okta token's `groups` claim (see `terraform/README.md`).
- Form types, the Aselo specification (`aseloForms.ts`) and its validator come from
  `lambdas/packages/hrm-form-definitions/src`, so the builder stays in step with what the
  plugin expects. `build-tools/hrmFormDefinitionsResolver.ts` lets the browser bundle use them
  without the package's Node-only loader; the package itself is unchanged.
- Exported JSON uses 2-space indentation, which matches most existing definition files.
- The preview splits forms into two columns using `splitFormAt` from
  `LayoutDefinitions.json`, the same way the plugin does.
