# as-v2: Case configuration showcase

v2 is **not** a realistic helpline. It is a **catalogue of case layout options**. Each
case section demonstrates one thing you can configure, so a partner can see the options
side by side and decide how they want their own cases to look.

Use it for technical audiences and implementation workshops ("how should your case page
look?"). For a sales demo of a realistic helpline, use v4, v5 or v6 (see the
[demo index](../README.md)).

Contact forms, call types and categories in v2 are a generic child helpline (the same
content as v1). Insights mapping is present but irrelevant for demos.

## The case sections and what each one shows

Every section form starts with two big text boxes, *"Here is how this is configured"* and
*"Here are the translations"*. They are there so you can paste the section's
configuration (from the table below or from `LayoutDefinitions.json`) into the demo
record. When the prospect opens the entry, they then see the result and the
configuration that produced it on the same screen.

| Section (key) | Where it appears | What it demonstrates | Settings in `LayoutDefinitions.json` |
| --- | --- | --- | --- |
| Timeline Case Section (`timelineCaseSection`) | Case **timeline**, mixed with contacts | A section placed in the timeline instead of in its own list | `caseHomeLocation: "timeline"`, `printFormat: "list"` |
| First List (`firstListCaseSection`) | Case home, list 1 | Basic field types: text input, text area, date. The date is the entry's event date. | `previewFields` + `includeLabel`; `format: "date"`; the form uses `metadata.eventTimestampSource` |
| Second List (`secondListCaseSection`) | List 2 | A required single select and a multi-select | `previewFields: ["select", "multiselect"]` |
| Third List (`thirdListCaseSection`) | List 3 | Checkbox vs mixed (yes/no/unknown) checkbox | `type: "checkbox"` / `"mixed-checkbox"` |
| Fourth List (`fourthListCaseSection`) | List 4 | Showing or hiding the field label in the list preview | `includeLabel: true` vs `false` |
| Fifth List (`fifthListCaseSection`) | List 5 | Column widths in the preview row | `widthRatio: 1`, `1.5`, `2` |
| Sixth List (`sixthListCaseSection`) | List 6 | File upload, and a section left **out of the PDF** | `format: "file"`, `printFormat: "hidden"` |
| Seventh List (`seventhListCaseSection`) | List 7 | PDF printed as a **table** | `printFormat: "tabular"`, `printOrder: 2` |
| Eighth List (`eighthListCaseSection`) | List 8 | Custom label text, and a **compound value** built from two fields | `labelTemplateCode`, `valueTemplateCode` (texts in `customStrings/Substitutions.json`) |

### Layout settings in plain words

- `caseHomeLocation`: `"list"` (default) gives the section its own block on the case
  home; `"timeline"` puts its entries in the timeline with the contacts; `"hidden"` shows
  it nowhere.
- `caseHomeOrder`: order of the list blocks on the case home (lowest first).
- `previewFields`: the fields shown as columns in the list (or joined with commas in the
  timeline). Always set it.
- `includeLabel`: shows "Label: value" instead of just the value in the list row.
- `widthRatio`: relative width of a column in the list row.
- `format`: how a value is displayed: `date`, `timestamp`, `file` (shows the file name),
  `duration-from-seconds` or `string`.
- `labelTemplateCode`: replaces the column label with a text from
  `customStrings/Substitutions.json` (or the built-in translations).
- `valueTemplateCode`: replaces the value with a text template that can use every field
  of the entry, e.g. `"{{field1}} / {{field2}}"`. It only applies when `format` is empty
  or `string`.
- `splitFormAt`: the field number where the add/edit form splits into two columns.
- `printOrder` / `printFormat`: order of the section in the case PDF, and whether it
  prints as a list, a table (`tabular`) or not at all (`hidden`).
- `case.hideCounselorDetails` (top level of `case`): hides counsellor names in the PDF.

## Tips for running the demo

1. **Prepare one demo case before the call.** Add one entry to each section, paste the
   section's settings into the "how this is configured" box, and save. Live typing of
   long configuration is slow and error-prone.
2. **Walk the case home top to bottom**, then open the timeline, then print the PDF. The
   PDF is where `printOrder`, `printFormat: "tabular"` and `"hidden"` become visible.
3. **Contrast pairs**: Fourth List (label on vs off) and Fifth List (widths) are the
   quickest way to show that small layout choices change how readable a case is.
4. **Bring the conversation back to their data**: once they've seen the options, ask
   which records they track per case (people involved, referrals, follow-ups,
   documents…). That becomes their real case design, and v4–v6 are good examples of
   finished designs.
5. Terminology is not customised in v2, so it uses the default wording (Child, Caller,
   Counsellor, Case). Use v5 or v6 to show renaming.

