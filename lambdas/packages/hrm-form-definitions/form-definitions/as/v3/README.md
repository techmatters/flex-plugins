# New helpline baseline (as/v3)

The starting point for the forms of a **new helpline**. It is a general "help seeker" setup that
works for most helplines (mental health, crisis, victim support, youth lines) and shows staff the
kinds of fields they can have. Customize it for each helpline; don't deploy `as-v3` itself to a
helpline.

Create a helpline's forms from it with:

```bash
node twilio-iac/scripts/onboarding/newHelplineForms.mjs --hl <code> --helpline "<display name>"
```

This copies this folder to `form-definitions/<code>/v1`, renames the helpline in
`HelplineInformation.json` and `IssueCategorizationTab.json` (the categories are looked up by the
`helpline` value in `twilio-iac/helplines/<code>/common.hcl`, so the two must match), and adds
`<code>-v1` to the validation tests.

## What's in it

| Area | Content |
|---|---|
| Call types | Help seeker about self / someone on behalf of a help seeker; silent, hang up, wrong number, abusive, information only, test |
| Help Seeker tab (`ChildInformationTab`) | name, age range, gender, language, phone, email, region → area (dependent select example), city, postal code, living situation, population groups (multi-select example) |
| Contacting On Behalf tab (`CallerInformationTab`) | name, relationship to help seeker, age, gender, language, phone, email, region → area |
| Categories | Mental Health, Violence and Abuse, Relationships, Physical Health, Basic Needs, Information (max 3 per contact) |
| Summary tab (`CaseInformationTab`) | repeat contact, urgency, action taken, how they heard about us, OK to contact back, felt helped, contact summary |
| Cases | overview (status, at risk, follow-up date, priority, summary); sections: note, referral, related person, incident, document; statuses open / in progress / closed |
| Webchat | pre-engagement form (nickname, age, gender, urgency) prefilled into the Help Seeker and Summary tabs |
| Texts | `customStrings/Substitutions.json` relabels the plugin's "child" wording to "help seeker" |
| Insights | a small mapping only (age, gender, relationship, repeat contact, action taken, how they heard, case id, referral) |

## Rules when customizing

- Field `name`s are the saved keys: rename them only before the helpline goes live. Some are used by
  the Flex plugin directly (`firstName`, `lastName`, `age`, `gender`, `language`, `province`,
  `callSummary`, `repeatCaller`, `relationshipToChild`, `childIsAtRisk`, `followUpDate`); keep those.
- The tab file names (`ChildInformationTab`, `CallerInformationTab`…) are fixed; change what users
  see through `Substitutions.json` and the field labels.
- `Region A/B` and `Area A1…` are placeholders: replace them with the helpline's real locations.
- Set `isPII` on anything that identifies a person.
- Check the Insights columns before adding mappings; they are a fixed, shared set.
- Run `npm test -- validateDefinitions` in `lambdas/packages/hrm-form-definitions` before pushing.
