resource "twilio_autopilot_assistants_v1" "chatbot_en" {
unique_name = "chatbot_EN"
friendly_name = "A bot that collects a pre-survey"
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

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_en_survey" {
unique_name = "survey"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_en.sid
actions = jsonencode(
{
	"actions": [
		{
			"remember": {
				"at": "survey"
			}
		},
		{
			"say": "${local.strings_en["Thank you. You can say 'Rather not say' (or type X) to any question"]}"
		},
		{
			"collect": {
				"name": "collect_survey",
				"questions": [
					{
						"question": "${local.strings_en["Provide a Nickname"]}",
						"name": "nickname",
						"type": "Twilio.FIRST_NAME",
						"validate": {
							"on_failure": {
								"messages": [
									{
										"say": "${local.strings_en["Sorry, I didn't understand that. Please respond with a name."]}"
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
					},
					{
						"question": "${local.strings_en["How old are you?"]}",
						"name": "age",
						"type": "Age",
						"validate": {
							"on_failure": {
								"messages": [
									{
										"say": "${local.strings_en["Sorry, I didn't understand that. Please respond with a number."]}"
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
					},
					{
						"question": "${local.strings_en["What is your gender?"]}",
						"name": "gender",
						"type": "Gender",
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
					},
					{
						"question": "${local.strings_en["How are you feeling?"]}",
						"name": "feeling",
						"type": "Feeling",
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
					},
					{
						"question": "${local.strings_en["Do you accept our Terms and Conditions?"]}",
						"name": "terms_conditions",
						"type": "YesNo",
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
					"redirect": "task://redirect_function"
				}
			}
		}
	]
}
)
}

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_en_redirect_function" {
unique_name = "redirect_function"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_en.sid
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

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_en_survey_start" {
unique_name = "survey_start"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_en.sid
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
						"question": "${local.strings_en["Are you calling about yourself?"]}",
						"name": "about_self",
						"type": "YesNo",
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
					"redirect": "task://survey"
				}
			}
		}
	]
})
}

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_en_collect_fallback" {
unique_name = "collect_fallback"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_en.sid
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


resource "twilio_autopilot_assistants_tasks_v1" "chatbot_en_counselor_handoff" {
unique_name = "counselor_handoff"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_en.sid
actions = jsonencode({
	"actions": [
		{
			"remember": {
				"at": "counselor_handoff",
				"sendToAgent": true
			}
		},
		{
			"say": "${local.strings_en["We'll transfer you now, please hold for a support mentor."]}"
		}
	]
})
}

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_en_fallback" {
unique_name = "fallback"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_en.sid
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

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_en_goodbye" {
unique_name = "goodbye"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_en.sid
actions = jsonencode({
  "actions": [
    {
      "say": "${local.strings_en["Thank you! Please reach out again if you need anything. Goodbye."]}"
    }
  ]
})
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "chatbot_en_goodbye_group" {
for_each = toset(["${local.strings_en["goodbye"]}","${local.strings_en["stop"]}"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_en.sid
task_sid      = twilio_autopilot_assistants_tasks_v1.chatbot_en_goodbye.sid
language = "en-US"
tagged_text = each.key
}

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_en_greeting" {
unique_name = "greeting"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_en.sid
actions = jsonencode({
	"actions": [
		{
			"remember": {
				"at": "greeting"
			}
		},
		{
			"say": "${local.strings_en["Welcome"]}"
		},
		{
			"redirect": "task://survey_start"
		}
	]
})
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "chatbot_en_greeting_group" {
for_each = toset(["${local.strings_en["hello"]}","${local.strings_en["hi"]}"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_en.sid
task_sid = twilio_autopilot_assistants_tasks_v1.chatbot_en_greeting.sid
language = "en-US"
tagged_text = each.key
}

resource "twilio_autopilot_assistants_field_types_v1" "chatbot_en_YesNo" {
unique_name = "YesNo"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_en.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_en_values_YesNo_group" {
for_each = toset(["${local.strings_en["No"]}","${local.strings_en["Yes"]}"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_en.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_en_YesNo.sid
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_en_synonymsOf_No_YesNo_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_en_values_YesNo_group]
for_each = toset(["${local.strings_en["Nope"]}"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_en.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_en_YesNo.sid
synonym_of = "${local.strings_en["No"]}"
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_en_synonymsOf_Yes_YesNo_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_en_values_YesNo_group]
for_each = toset(["${local.strings_en["Yeah"]}"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_en.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_en_YesNo.sid
synonym_of = "${local.strings_en["Yes"]}"
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_v1" "chatbot_en_Gender" {
unique_name = "Gender"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_en.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_en_values_Gender_group" {
for_each = toset(["${local.strings_en["Rather not say"]}","${local.strings_en["Others"]}","${local.strings_en["Female"]}","${local.strings_en["Male"]}"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_en.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_en_Gender.sid
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_en_synonymsOf_Rather_not_say_Gender_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_en_values_Gender_group]
for_each = toset(["x"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_en.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_en_Gender.sid
synonym_of = "${local.strings_en["Rather not say"]}"
value = each.key
language = "en-US"
}



resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_en_synonymsOf_Female_Gender_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_en_values_Gender_group]
for_each = toset(["${local.strings_en["girl"]}"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_en.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_en_Gender.sid
synonym_of = "${local.strings_en["Female"]}"
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_en_synonymsOf_Male_Gender_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_en_values_Gender_group]
for_each = toset(["${local.strings_en["boy"]}"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_en.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_en_Gender.sid
synonym_of = "${local.strings_en["Male"]}"
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_v1" "chatbot_en_Age" {
unique_name = "Age"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_en.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_en_values_Age_group" {
for_each = toset(["${local.strings_en["Rather not say"]}","89","88","31","61","86","47","5","92","63","24","42","9","50","75","66","58","74","48","85","39","84","87","76","38","21","8","49","17","59","96","34","26","27","28","73","22","77","79","23","64","71","82","46","98","100","68","81","16","19","95","20","44","6","37","4","99","56","90","33","12","93","15","80","70","97","91","13","51","43","67","65","29","11","57","7","54","14","94","52","78","18","41","62","25","60","55","72","35","36","1","32","69","53","3","2","10","40","83","45", "30"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_en.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_en_Age.sid
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_en_synonymsOf_Rather_not_say_Age_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_en_values_Age_group]
for_each = toset(["X"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_en.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_en_Age.sid
synonym_of = "${local.strings_en["Rather not say"]}"
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_v1" "chatbot_en_Feeling" {
unique_name = "Feeling"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_en.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_en_values_Feeling_group" {
for_each = toset(["${local.strings_en["Rather not say"]}","${local.strings_en["Happy"]}","${local.strings_en["Confused"]}","${local.strings_en["Angry"]}","${local.strings_en["Shocked"]}","${local.strings_en["Uncertain"]}","${local.strings_en["Scared"]}"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_en.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_en_Feeling.sid
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_en_synonymsOf_Rather_not_say_Feeling_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_en_values_Feeling_group]
for_each = toset(["x"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_en.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_en_Feeling.sid
synonym_of = "${local.strings_en["Rather not say"]}"
value = each.key
language = "en-US"
}



resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_en_synonymsOf_Happy_Feeling_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_en_values_Feeling_group]
for_each = toset(["1"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_en.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_en_Feeling.sid
synonym_of = "${local.strings_en["Happy"]}"
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_en_synonymsOf_Confused_Feeling_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_en_values_Feeling_group]
for_each = toset(["2"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_en.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_en_Feeling.sid
synonym_of = "${local.strings_en["Confused"]}"
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_en_synonymsOf_Angry_Feeling_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_en_values_Feeling_group]
for_each = toset(["3"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_en.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_en_Feeling.sid
synonym_of = "${local.strings_en["Angry"]}"
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_en_synonymsOf_Shocked_Feeling_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_en_values_Feeling_group]
for_each = toset(["4"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_en.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_en_Feeling.sid
synonym_of = "${local.strings_en["Shocked"]}"
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_en_synonymsOf_Scared_Feeling_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_en_values_Feeling_group]
for_each = toset(["5"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_en.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_en_Feeling.sid
synonym_of = "${local.strings_en["Scared"]}"
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_en_synonymsOf_Uncertain_Feeling_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_en_values_Feeling_group]
for_each = toset(["6"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_en.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_en_Feeling.sid
synonym_of = "${local.strings_en["Uncertain"]}"
value = each.key
language = "en-US"
}
