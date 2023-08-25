# Cascading logic to load lex files

The code processes configuration files (JSON files) related to Lex bots, intents, and slot types based on different conditions and fallback options. The paths to these JSON files are constructed using short_helpline, language and bots name.

This hierarchical structure of fallback paths allows for flexibility in configuration organization and retrieval, accommodating various possible folder structures and paths for different languages and resources.

The order in which the system tries to find a specific JSON configuration file is as follows:

"/app/twilio-iac/helplines/${local.short_helpline}/configs/lex/${language}/bots/${bot}.json"
"/app/twilio-iac/helplines/${local.short_helpline}/configs/lex/common/bots/${bot}.json"
"/app/twilio-iac/helplines/configs/lex/${language}/bots/${bot}.json"
"/app/twilio-iac/helplines/configs/lex/${substr(language, 0, 2)}/bots/${bot}.json"