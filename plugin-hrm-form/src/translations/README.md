# Translations / Internationalization Setup

## Translations Setup Overview

The Hierarchical Translation System (in `translations/locales`) will replace the Legacy Translation System (in `/translations`). This will allow for a more flexible and maintainable way to manage translations.

### Language Hierarchy
1. Base language translation found in `/translations/locales` (e.g., `en`)
2. Cultural variant translation found in `/translations/locales` (e.g., `en-US`). A key in `en-US` will override a key in `en`
3. Helpline-specific terminologies found in `hrm-form-definitions/form-definitions/<helplineCode>/v1/translations/Substitutions.json` (e.g., `en`). A key in this file will override a key in the base language and cultural variant.

### Translation Setup Checklist
1. Ensure that the **`helplineLanguage`** (e.g., `fr-FR`) which is the language code of the helpline in the cultural variant in the service configuration. Note that a fallback is not supported.
2. Enable the `enable_hierarchical_translations` flag in service configuration (This could change in the future, as in the flag could be deprecated and the hierarchical translations feature will be default behavior)
3. Based on the default language, check `/translations/locales` for a base language translation and a cultural variant translation. For example, if it is a helpline in France, the base language is likely `fr` and the cultural variant is likely `fr-FR`. Create these files if they don't exist.
4. Add the helpline-specific translations/terminologies to the helpline-specific file and language in `hrm-form-definitions/form-definitions/<helplineCode>/v1/translations/Substitutions.json`.
5. Apply the service configuration to the helpline in the twilio-iac.

### Best Practices

1. Use base language files for common translations. Most translations a helpline is likely to use will be in the base language.
2. Only override necessary strings in regional/locale variants. For example, when 'counselor' is typical in en-US, while 'counsellor' is more typical in en-GB or en-CA.
3. Keep helpline-specific translations minimal. Use it for special cases and terminology that are unique to the helpline. (e.g., 'Incident Report' for KHP as opposed to 'Case' by default)


## Messages Setup

Previously, messages were stored in `assets/translations/{locale}/messages.json` or in serverless repo. This will be deprecated in the future. From now on, messages are stored in `hrm-form-definitions/form-definitions/<helplineCode>/v1/translations/Messages.json` much like how webchat messages are configured by language.