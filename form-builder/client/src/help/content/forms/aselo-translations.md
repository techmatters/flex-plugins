---
title: Translations
kind: section
audience: aselo
order: 52
questions:
  - how do I translate aselo for a helpline
  - add a language
  - change a string in aselo
  - substitutions json
  - find and replace a word everywhere
  - send the strings to a translator
  - translate a field label
  - why isn't my change showing
  - translate the webchat
keywords: webchat, locale, translations, translate, language, substitutions, strings, customStrings, find, replace, spreadsheet, csv, translator, locale, es, fr, override
---

**Translations** (under **Helpline**, Aselo staff only) lists every string counselors see in Aselo, per language, with the helpline's own versions of them. Helpline staff don't see it: they choose their words in **Helpline terms**, which writes the same file.

For a helpline with a webchat, **Aselo (counselors)** / **Webchat (people contacting you)** switches between Aselo's text and the webchat's. The webchat's works the same way, from its own files (`aselo-webchat-react-app/translationsSrc`) and the helpline's file for each locale (`configSrc/<code>/translations/en-US.json`...), so its languages are locales (`es-CL`). A webchat change needs a webchat deploy.

The automatic chat messages and the post-survey message aren't here: they're in **Automatic chat messages**, per language.

**How Aselo picks a string:** its own text (`en.json`, then the language's file, then the locale's, e.g. `es-CL`), then the helpline's `customStrings/Substitutions.json` for the base language (`en`, `es`...). A helpline's string replaces Aselo's **whole string**, and stops following Aselo's when that changes.

Each string shows where its text comes from:

- no badge: Aselo's own text;
- **From helpline terms**: made from the words in Helpline terms (changing the words changes it);
- **Changed**: written for this helpline;
- **Helpline only**: a key Aselo doesn't have, e.g. a field label;
- **English**: Aselo has no translation in this language yet, so counselors see English.

What you can do:

- **Change a string**: click its key. **Use Aselo's text again** removes the helpline's version. Text the same as Aselo's isn't kept.
- **Find & replace** across every string of the language, with each match listed before and after: untick the ones to leave. Without **Match case**, capitals follow each match (Child → Help seeker).
- **Add a language**: Aselo has text in es, fr, pt, hu and th; any other two-letter code works too, with English until it's translated.
- **Export spreadsheet** for a translator to fill in the **Helpline** column, then **Import spreadsheet**: only changed rows count, and an empty cell goes back to Aselo's text.
- **Add a string**: field labels, answers and categories are looked up by their own text, so a form can be translated by adding its text as a key.

> Strings written by hand are never overwritten by Helpline terms. In Helpline terms, Aselo staff can choose to make them from the terms.

Changes reach counselors after the form definitions are deployed and Flex is reloaded. Counselors who change their language need to refresh the browser.
