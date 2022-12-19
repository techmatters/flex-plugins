resource "twilio_autopilot_assistants_v1" "chatbot_language_selector" {
unique_name = "chatbot_language_selector"
friendly_name = "A bot that selects the language"
style_sheet = jsonencode({
  "style_sheet": {
    "collect": {
      "validate": {
        "on_failure": {
          "repeat_question": false,
          "messages": [
            {
              "say": {
                "speech": "${local.strings_en["I didn't get that. What did you say?"]}"
              }
            },
            {
              "say": {
                "speech": "${local.strings_en["I still didn't catch that. Please repeat."]}"
              }
            },
            {
              "say": {
                "speech": "${local.strings_en["Let's try one last time. Say it again please."]}"
              }
            }
          ]
        },
        "on_success": {
          "say": {
            "speech": ""
          }
        },
        "max_attempts": 4
      }
    },
    "voice": {
      "say_voice": "Polly.Matthew"
    },
    "name": ""
  }
})
defaults = jsonencode({
  "defaults": {
    "assistant_initiation": "task://greeting",
    "fallback": "task://fallback",
    "collect": {
      "validate_on_failure": "task://collect_fallback"
    }
  }
})
log_queries = true
}



resource "twilio_autopilot_assistants_tasks_v1" "chatbot_language_selector_redirect_function" {
unique_name = "redirect_function"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_language_selector.sid
actions = jsonencode({
  "actions": [
    {
      "redirect": {
        "method": "POST",
        "uri": "${var.serverless_url}/autopilotRedirect"
      }
    }
  ]
})
}

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_language_selector_survey_start" {
unique_name = "survey_start"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_language_selector.sid
actions = jsonencode({
	"actions": [
		{
			"remember": {
				"at": "survey_start"
			}
		},
		{
			"collect": {
				"name": "collect_survey",
				"questions": [
					{
						"question": "What language do you speak? Please select from the below supported languages: \n 1. English \n 2. Maltese \n 3. Ukranian}",
						"name": "language",
						"type": "Language",
						"validate": {
							"on_failure": {
								"messages": [
									{
										"say": "${local.strings_en["Sorry, I didn't understand that. Please try again."]}"
									},
									{
										"say": "${local.strings_en["Sorry, I still didn't get that."]}"
									}
								],
								"repeat_question": true
							},
							"max_attempts": {
								"redirect": "task://redirect_function",
								"num_attempts": 2
							}
						}
					}
				],
				"on_complete": {
					"redirect": "task://language_msg"
				}
			}
		}
	]
})
}

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_language_selector_collect_fallback" {
unique_name = "collect_fallback"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_language_selector.sid
actions = jsonencode({
  "actions": [
    {
      "say": "Looks like I'm having trouble. Apologies for that. Let's start again, how can I help you today?"
    },
    {
      "listen": true
    }
  ]
})
}


resource "twilio_autopilot_assistants_tasks_v1" "chatbot_language_selector_language_msg" {
unique_name = "language"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_language_selector.sid
actions = jsonencode({
	"actions": [

		{
			"say": "Thank you"
		}
	]
})
}

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_language_selector_fallback" {
unique_name = "fallback"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_language_selector.sid
actions = jsonencode({
  "actions": [
    {
      "say": "${local.strings_en["Sorry, I didn't understand that. Please try again."]}"
    },
    {
      "listen": true
    }
  ]
})
}

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_language_selector_goodbye" {
unique_name = "goodbye"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_language_selector.sid
actions = jsonencode({
  "actions": [
    {
      "say": "${local.strings_en["Thank you! Goodbye."]}"
    }
  ]
})
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "chatbot_language_selector_goodbye_group" {
for_each = toset(["${local.strings_en["goodbye"]}","${local.strings_en["stop"]}"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_language_selector.sid
task_sid      = twilio_autopilot_assistants_tasks_v1.chatbot_language_selector_goodbye.sid
language = "en-US"
tagged_text = each.key
}

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_language_selector_greeting" {
unique_name = "greeting"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_language_selector.sid
actions = jsonencode({
	"actions": [
		{
			"remember": {
				"at": "greeting"
			}
		},
		{
			"say": "Welcome to our helpline."
		},
		{
			"redirect": "task://survey_start"
		}
	]
})
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "chatbot_language_selector_greeting_group" {
for_each = toset(["${local.strings_en["hello"]}","${local.strings_en["hi"]}"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_language_selector.sid
task_sid = twilio_autopilot_assistants_tasks_v1.chatbot_language_selector_greeting.sid
language = "en-US"
tagged_text = each.key
}

resource "twilio_autopilot_assistants_field_types_v1" "chatbot_language_selector_Language" {
unique_name = "Language"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_language_selector.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_language_selector_values_Language_group" {
for_each = toset(["en-MT","mt-MT","ukr-MT"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_language_selector.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_language_selector_Language.sid
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_language_selector_synonymsOf_enMT_Language_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_language_selector_values_Language_group]
for_each = toset(["1","english"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_language_selector.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_language_selector_Language.sid
synonym_of = "en-MT"
value = each.key
language = "en-US"
}
resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_language_selector_synonymsOf_mtMT_Language_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_language_selector_values_Language_group]
for_each = toset(["2","maltese"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_language_selector.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_language_selector_Language.sid
synonym_of = "mt-MT"
value = each.key
language = "en-US"
}
resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_language_selector_synonymsOf_ukrMT_Language_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_language_selector_values_Language_group]
for_each = toset(["3","ukranian"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_language_selector.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_language_selector_Language.sid
synonym_of = "ukr-MT"
value = each.key
language = "en-US"
}
