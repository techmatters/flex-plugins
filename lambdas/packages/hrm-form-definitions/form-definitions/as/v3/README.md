# New helpline baseline (as/v3)

The starting point for the forms of a **new helpline**. It is a general "help seeker" setup in US
terms (State → County, ZIP code, 988/911) that works for most helplines (mental health, crisis,
victim support, youth lines), and it includes **one example of every form capability**, so whoever
reviews it with the helpline can see what is possible. Customize it for each helpline and remove
what they don't need; don't deploy `as-v3` itself to a helpline.

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
| Help Seeker tab (`ChildInformationTab`) | name, pronouns, age range, gender, language, phone, email, State → County, city, ZIP code, people in household, living situation, population groups, consent to follow-up |
| Contacting On Behalf tab (`CallerInformationTab`) | name, relationship to help seeker, age, gender, language, phone, email, State → County |
| Categories | Mental Health, Violence and Abuse, Relationships, Physical Health, Basic Needs, Information (max 3 per contact) |
| Summary tab (`CaseInformationTab`) | repeat contact, urgency, action taken, how they heard about us, OK to contact back, felt helped, contact summary |
| Cases | overview (status, at risk, follow-up date, priority, summary); sections: note, referral, related person, person causing harm, incident, document; statuses open / in progress / closed; filters by status, counselor, priority and dates |
| Webchat | pre-engagement form (nickname, age, gender, state, urgency), prefilled into the Help Seeker and Summary tabs |
| Texts | `customStrings/Substitutions.json` relabels the plugin's "child" wording to "help seeker" |
| Insights | a small mapping only (age, gender, ZIP, relationship, repeat contact, action taken, how they heard, case id, referral) |

The states and counties are **examples** (four states, three counties each): replace them with the
helpline's service area.

## Where to see each capability

| Capability | Example |
|---|---|
| Text input with placeholder | Help Seeker › First Name |
| Help text under a field (`description`: title + "Read more" text) | Help Seeker › County, People in Household, Population Groups, Consents to a follow-up contact; Summary › Urgency Level |
| Required field | Help Seeker › Age, Gender; Summary › Urgency Level, Contact Summary |
| Length limits (`minLength`, `maxLength`) | Help Seeker › ZIP Code, Phone; Summary › Contact Summary |
| Number with limits (`numeric-input`, `min`, `max`) | Help Seeker › People in Household |
| Email (`email`) | Help Seeker › Email |
| Dropdown (`select`) | Help Seeker › Gender, State |
| Dropdown that depends on another (`dependent-select`) | Help Seeker › County (depends on State) |
| Options shared from `ReferenceData.json` (`optionsReferenceKey`) | Case › Related Person / Person Causing Harm › State, County (works in case forms only) |
| Radio buttons with a default (`radio-input`) | Help Seeker › Pronouns; Case › Incident › Duration |
| Multi-select list with a height (`listbox-multiselect`) | Help Seeker › Population Groups; Summary › Action Taken |
| Checkbox (`checkbox`) | Summary › Repeat Contact |
| Yes / no / not asked (`mixed-checkbox`) | Help Seeker › Consents to a follow-up contact; Summary › Felt helped |
| Long text (`textarea`, `rows`) | Summary › Contact Summary; Case › Note |
| Button next to a field (`additionalActions`) | Summary › Contact Summary › Generate Summary (only with the `enable_llm_summary` feature flag) |
| Date, and date pre-filled with today (`initializeWithCurrent`) | Case › Incident › Date; Case › Referral › Date |
| Time (`time-input`) | Case › Incident › Time |
| File upload (`file-upload`) | Case › Document |
| Copy a case section to another (`copy-to`) | Case › Related Person ⇄ Person Causing Harm |
| Link to guidance on a category (`toolkitUrl`) | Categories › Mental Health › Suicidal thoughts |
| Personal data flag (`isPII`) | every name, phone, email, ZIP and free-text field |

Not included: `search-input` (used by search forms) and helpline-specific custom components
(`resource-referral-list` needs the resources service).

## Rules when customizing

- Field `name`s are the saved keys: rename them only before the helpline goes live. Some are used by
  the Flex plugin directly (`firstName`, `lastName`, `age`, `gender`, `language`, `callSummary`,
  `repeatCaller`, `relationshipToChild`, `childIsAtRisk`, `followUpDate`); keep those.
- The tab file names (`ChildInformationTab`, `CallerInformationTab`…) are fixed; change what users
  see through `Substitutions.json` and the field labels.
- Set `isPII` on anything that identifies a person.
- Check the Insights columns before adding mappings; they are a fixed, shared set.
- Run `npm test -- validateDefinitions` in `lambdas/packages/hrm-form-definitions` before pushing.
