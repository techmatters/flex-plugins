# Cascading logic to load lex files

The code processes configuration files (JSON files) related to Lex V2 bots, intents, slots and slot types based on different conditions and fallback options. The paths to these JSON files are constructed using short_helpline, language and bots name.

This hierarchical structure of fallback paths allows for flexibility in configuration organization and retrieval, accommodating various possible folder structures and paths for different languages and resources.

The order in which the system tries to find a specific JSON configuration file is as follows (shown for bots):

"/app/twilio-iac/helplines/${local.short_helpline}/configs/lex_v2/${language}/bots/${bot}.json"
"/app/twilio-iac/helplines/${local.short_helpline}/configs/lex_v2/common/bots/${bot}.json"
"/app/twilio-iac/helplines/configs/lex_v2/${language}/bots/${bot}.json"
"/app/twilio-iac/helplines/configs/lex_v2/${substr(language, 0, 2)}/bots/${bot}.json"

The same order is used for `intents/`, `slots/` and `slot_types/`. Slot types whose name starts with `AMAZON` are built into Lex and are not loaded from a file.