# Aselo Form Builder

A web app for helpline staff to configure their Aselo forms (contact forms, issue
categories, case sections and statuses) without editing JSON by hand.

It reads and writes the same files the Flex plugin uses:
`lambdas/packages/hrm-form-definitions/form-definitions/<helpline>/<version>/`.

## Status

**Phase 2: contact form editing.**

- The three contact form tabs (Caller, Child and Case information) can be edited:
  drag fields to reorder them or move them between columns, add fields, change questions,
  answers, required, hint text and PII.
- **Try it out** shows the edited form working as counselors would use it.
- Changes are kept as a draft in the browser (local storage) and checked as you go.
- **Review & export** lists the changes in plain language and downloads a zip of the
  changed files, laid out like the repo, plus a `CHANGES.md` for the reviewer.
- Issue categories and cases are still preview only.

**Aselo staff mode** (top right) shows settings that affect saved data: field names, PII on
existing fields, and switching an existing field's kind. It's a plain switch until Okta
sign-in decides who is staff.

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

Planned next:

1. Issue categories, cases and client profiles
2. Shared drafts, Okta login, and "Apply" (writes the JSON to a new branch for review)
3. Terraform deployment

## Running locally

```bash
cd form-builder
npm install
npm run dev
```

Open http://localhost:5180.

In development the app reads form definitions straight from this repo checkout. To
point it at a different checkout, set `FORM_DEFINITIONS_DIR` before `npm run dev`.

## Checks

```bash
npm run typecheck   # TypeScript, including the shared form-definition types
npm test            # unit tests, plus every helpline loaded and validated, plus UI tests in jsdom
npm run build
```

## How it fits together

- `server/definitionsApi.ts` reads raw definition files for a helpline. In development
  it's served by the Vite dev server (`server/devApiPlugin.ts`); the deployed backend
  will implement the same routes.
- Form types, the Aselo specification (`aseloForms.ts`) and its validator come from
  `lambdas/packages/hrm-form-definitions/src`, so the builder stays in step with what the
  plugin expects. `build-tools/hrmFormDefinitionsResolver.ts` lets the browser bundle use them
  without the package's Node-only loader; the package itself is unchanged.
- Exported JSON uses 2-space indentation, which matches most existing definition files.
- The preview splits forms into two columns using `splitFormAt` from
  `LayoutDefinitions.json`, the same way the plugin does.
