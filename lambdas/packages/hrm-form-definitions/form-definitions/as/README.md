# Aselo demo form definitions (`as`)

The `as` helpline is the Aselo demo environment. This folder holds several **form
definition versions**. Each one makes Aselo look like a different kind of helpline:
different contact forms, case sections, client profile, categories and terminology.
Pick the version that best matches the organisation you are presenting to.

None of the demo versions (v2–v5) map data to Flex Insights. Reporting is not part of
these demos.

## Which version should I use?

| Version | Looks like | Use it when the prospect is... | Terminology used in the UI |
| --- | --- | --- | --- |
| [v1](v1/README.md) | Original generic child helpline (legacy demo) | Only for backwards compatibility. Prefer v3. | Default (Child, Caller, Counsellor, Case) |
| [v2](v2/README.md) | **Case configuration showcase**: every case section shows one layout option | A technical audience, or an implementation workshop where the partner designs its own case forms | Default |
| [v3](v3/README.md) | **Child & youth helpline** | A child helpline, youth line, child protection service, school or online-safety service | Child, Caller, Counselor, Case, Young Person Profile |
| [v4](v4/README.md) | **Mental health support line / warmline** | A mental health line, warmline, peer-support line, or a family and caregiver support line | Help Seeker, Supporter, Specialist, Support Plan |
| [v5](v5/README.md) | **Crisis & emergency response line** | A crisis line that dispatches help, a mobile crisis team, a disaster or emergency hotline, or a public safety partner | Person at Risk, Reporting Party, Responder, Incident |

Quick rule of thumb:

- The person contacting is usually **a child, or an adult worried about a child**: use **v3**.
- The person is usually **an adult looking for emotional support or services**: use **v4**.
- The conversation is about **getting help to someone quickly**: use **v5**.
- The partner wants to know **"how flexible are cases?"**: use **v2** (you can open it alongside one of the others).

## What every version contains

| Area | File(s) | What the prospect sees |
| --- | --- | --- |
| Call types | `CallTypeButtons.json` | The buttons a counsellor uses to categorise a contact (data contacts open the forms; non-data ones such as "Silent" close the task straight away) |
| Contact form | `tabbedForms/*.json` | The tabs filled in during or after a conversation: caller, the person being helped, categories, summary |
| Categories | `tabbedForms/IssueCategorizationTab.json` | The issue categories and sub-categories |
| Cases | `CaseSections.json`, `caseForms/*.json`, `CaseStatus.json`, `CaseFilters.json`, `LayoutDefinitions.json` | The case page, its sections, statuses and filters |
| Client profile | `profileForms/*.json` | The free-text sections on a client's profile, and the block durations |
| Helpline terms | `customStrings/Substitutions.json` | Renames words throughout the UI (e.g. "Counsellor" → "Specialist", "Case" → "Incident") |
| Chat messages | `customStrings/Messages.json` | Automatic chat messages (welcome, goodbye, out of hours) |
| Canned responses | `CannedResponses.json` | Pre-written replies available in chat |
| Shared option lists | `ReferenceData.json` | Option lists reused by several fields (region, gender…) via `optionsReferenceKey` |
| Side-menu link | `CustomLinks.json` | A link in the Flex side menu (points to example.org; change it if you want a real page) |

## How to switch the demo environment to a version

There is **no switcher in the Flex UI**. The version is set by the `definitionVersion`
attribute of the Flex service configuration, and it applies to **everyone** using that
environment. Coordinate with anyone else who is demoing on the same environment.

1. **Deploy the form definitions** (only needed if they changed since the last deploy).
   GitHub Actions → *Deploy form-definitions to S3* → environment `staging` (or
   `production`), helpline code `as`. This uploads every `as/` version at once.
2. **Point the service configuration at the version.** In
   `twilio-iac/helplines/as/configs/service-configuration/`, set
   `"definitionVersion": "as-v4"` (for example). To change only one environment, put it
   in `staging.json` or `production.json` instead of `common.json`. Then plan and apply
   the `configure` stage for `as` in that environment.
3. **Reload Flex** (a full browser refresh). The definitions are loaded once, when Flex
   starts.

The version id is `as-` plus the folder name. Only the last two characters are used to
find the folder, so a future `v10` will need a code change first.

## Good to know before the demo

- **Existing contacts and cases keep their own version.** A contact saved under v3 still
  shows v3's forms after you switch to v4. However, **helpline terms always come from the
  current version**, so old records will show the new wording. For a clean demo, create
  fresh demo contacts after switching.
- **Feature flags.** Client profiles, case features, the resource referral list
  ("Resources Shared") and similar features must be enabled in the `as` service
  configuration. They are enabled in `common.json` today; check before a demo if
  anything is missing.
- **Pre-survey / pre-engagement prefill.** Only **v3** maps the demo pre-survey answers
  (age, gender, first name) into the contact form, because the `as` chatbot asks
  child-helpline questions. v4 and v5 intentionally do not prefill.
- **Webchat pre-engagement form.** v2–v5 do not include `webchat/PreEngagementForm.json`.
  The webchat demo keeps using its own configuration.
- **Insights.** `insights/oneToOneConfigSpec.json` is `{}` and
  `insights/oneToManyConfigSpecs.json` is `[]` in every demo version, so nothing from the
  forms is sent to Flex Insights.
- **Test data only.** Use invented names, phone numbers and addresses during demos, even
  in fields marked as private (PII).

## Changing a version

- Read `src/aseloForms.ts` (allowed structure) and `src/formDefinition/types.ts` (field
  types) in `lambdas/packages/hrm-form-definitions` before inventing a new shape.
- **Never rename a field's `name` after it has been used**: it is the key saved in the
  database. Change the `label` instead.
- If you add a **new case section** (a new key in `CaseSections.json`), also add its
  entries to `LayoutDefinitions.json` and its button and heading texts to
  `customStrings/Substitutions.json` (`Case-SectionList-Title/<key>`,
  `CaseSection-Add/<key>`…). Without those texts the UI shows the raw keys.
- The keys of `IssueCategorizationTab.json` must match the helpline `value` in
  `HelplineInformation.json` exactly (including upper/lower case). Otherwise the
  categories silently fall back to the default helpline.
- `child` and `caller` are special call types (they open the forms). You can change
  their labels freely, but keep their `name`s.
- Validate before pushing:

  ```bash
  cd lambdas/packages/hrm-form-definitions
  npm test
  ```

  v1, v3, v4 and v5 are part of the validation test (`src/__tests__/definitionVersionId.ts`).
  v2 is not, because the test expects an `incident` case section and v2 deliberately
  uses demo-only section names.
