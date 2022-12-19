resource "twilio_autopilot_assistants_v1" "chatbot_mt" {
unique_name = "chatbot_mt"
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
                "speech": "${local.strings_mt["I didn't get that. What did you say?"]}"
              }
            },
            {
              "say": {
                "speech": "${local.strings_mt["I still didn't catch that. Please repeat."]}"
              }
            },
            {
              "say": {
                "speech": "${local.strings_mt["Let's try one last time. Say it again please."]}"
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

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_mt_survey" {
unique_name = "survey"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_mt.sid
actions = jsonencode(
{
	"actions": [
		{
			"remember": {
				"at": "survey"
			}
		},
		{
			"say": "${local.strings_mt["Thank you. You can say 'Rather not say' (or type X) to any question"]}"
		},
		{
			"collect": {
				"name": "collect_survey",
				"questions": [
					{
						"question": "${local.strings_mt["Provide a Nickname"]}",
						"name": "nickname",
						"type": "Twilio.FIRST_NAME",
						"validate": {
							"on_failure": {
								"messages": [
									{
										"say": "${local.strings_mt["Sorry, I didn't understand that. Please respond with a name."]}"
									},
									{
										"say": "${local.strings_mt["Sorry, I still didn't get that."]}"
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
						"question": "${local.strings_mt["How old are you?"]}",
						"name": "age",
						"type": "Age",
						"validate": {
							"on_failure": {
								"messages": [
									{
										"say": "${local.strings_mt["Sorry, I didn't understand that. Please respond with a number."]}"
									},
									{
										"say": "${local.strings_mt["Sorry, I still didn't get that."]}"
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
						"question": "${local.strings_mt["What is your gender?"]}",
						"name": "gender",
						"type": "Gender",
						"validate": {
							"on_failure": {
								"messages": [
									{
										"say": "${local.strings_mt["Sorry, I didn't understand that. Please try again."]}"
									},
									{
										"say": "${local.strings_mt["Sorry, I still didn't get that."]}"
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
						"question": "${local.strings_mt["How are you feeling?"]}",
						"name": "feeling",
						"type": "Feeling",
						"validate": {
							"on_failure": {
								"messages": [
									{
										"say": "${local.strings_mt["Sorry, I didn't understand that. Please try again."]}"
									},
									{
										"say": "${local.strings_mt["Sorry, I still didn't get that."]}"
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
						"question": "${local.strings_mt["Do you accept our Terms and Conditions?"]}",
						"name": "terms_conditions",
						"type": "YesNo",
						"validate": {
							"on_failure": {
								"messages": [
									{
										"say": "${local.strings_mt["Sorry, I didn't understand that. Please try again."]}"
									},
									{
										"say": "${local.strings_mt["Sorry, I still didn't get that."]}"
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

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_mt_redirect_function" {
unique_name = "redirect_function"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_mt.sid
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

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_mt_survey_start" {
unique_name = "survey_start"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_mt.sid
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
						"question": "${local.strings_mt["Are you calling about yourself?"]}",
						"name": "about_self",
						"type": "YesNo",
						"validate": {
							"on_failure": {
								"messages": [
									{
										"say": "${local.strings_mt["Sorry, I didn't understand that. Please try again."]}"
									},
									{
										"say": "${local.strings_mt["Sorry, I still didn't get that."]}"
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

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_mt_collect_fallback" {
unique_name = "collect_fallback"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_mt.sid
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


resource "twilio_autopilot_assistants_tasks_v1" "chatbot_mt_counselor_handoff" {
unique_name = "counselor_handoff"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_mt.sid
actions = jsonencode({
	"actions": [
		{
			"remember": {
				"at": "counselor_handoff",
				"sendToAgent": true
			}
		},
		{
			"say": "${local.strings_mt["We'll transfer you now, please hold for a support mentor."]}"
		}
	]
})
}

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_mt_fallback" {
unique_name = "fallback"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_mt.sid
actions = jsonencode({
  "actions": [
    {
      "say": "${local.strings_mt["Sorry, I didn't understand that. Please try again."]}"
    },
    {
      "listen": true
    }
  ]
})
}

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_mt_goodbye" {
unique_name = "goodbye"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_mt.sid
actions = jsonencode({
  "actions": [
    {
      "say": "${local.strings_mt["Thank you! Goodbye."]}"
    }
  ]
})
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "chatbot_mt_goodbye_group" {
for_each = toset(["${local.strings_mt["goodbye"]}","${local.strings_mt["stop"]}"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_mt.sid
task_sid      = twilio_autopilot_assistants_tasks_v1.chatbot_mt_goodbye.sid
language = "en-US"
tagged_text = each.key
}

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_mt_greeting" {
unique_name = "greeting"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_mt.sid
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

resource "twilio_autopilot_assistants_tasks_samples_v1" "chatbot_mt_greeting_group" {
for_each = toset(["${local.strings_mt["hello"]}","${local.strings_mt["hi"]}"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_mt.sid
task_sid = twilio_autopilot_assistants_tasks_v1.chatbot_mt_greeting.sid
language = "en-US"
tagged_text = each.key
}

resource "twilio_autopilot_assistants_field_types_v1" "chatbot_mt_YesNo" {
unique_name = "YesNo"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_mt.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_mt_values_YesNo_group" {
for_each = toset(["${local.strings_mt["No"]}","${local.strings_mt["Yes"]}"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_mt.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_mt_YesNo.sid
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_mt_synonymsOf_No_YesNo_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_mt_values_YesNo_group]
for_each = toset(["${local.strings_mt["Nope"]}"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_mt.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_mt_YesNo.sid
synonym_of = "${local.strings_mt["No"]}"
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_mt_synonymsOf_Yes_YesNo_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_mt_values_YesNo_group]
for_each = toset(["${local.strings_mt["Yeah"]}"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_mt.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_mt_YesNo.sid
synonym_of = "${local.strings_mt["Yes"]}"
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_v1" "chatbot_mt_Gender" {
unique_name = "Gender"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_mt.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_mt_values_Gender_group" {
for_each = toset(["${local.strings_mt["Rather not say"]}","${local.strings_mt["Others"]}","${local.strings_mt["Female"]}","${local.strings_mt["Male"]}"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_mt.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_mt_Gender.sid
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_mt_synonymsOf_Rather_not_say_Gender_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_mt_values_Gender_group]
for_each = toset(["x"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_mt.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_mt_Gender.sid
synonym_of = "${local.strings_mt["Rather not say"]}"
value = each.key
language = "en-US"
}



resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_mt_synonymsOf_Female_Gender_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_mt_values_Gender_group]
for_each = toset(["${local.strings_mt["girl"]}"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_mt.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_mt_Gender.sid
synonym_of = "${local.strings_mt["Female"]}"
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_mt_synonymsOf_Male_Gender_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_mt_values_Gender_group]
for_each = toset(["${local.strings_mt["boy"]}"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_mt.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_mt_Gender.sid
synonym_of = "${local.strings_mt["Male"]}"
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_v1" "chatbot_mt_Age" {
unique_name = "Age"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_mt.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_mt_values_Age_group" {
for_each = toset(["${local.strings_mt["Rather not say"]}","89","88","31","61","86","47","5","92","63","24","42","9","50","75","66","58","74","48","85","39","84","87","76","38","21","8","49","17","59","96","34","26","27","28","73","22","77","79","23","64","71","82","46","98","100","68","81","16","19","95","20","44","6","37","4","99","56","90","33","12","93","15","80","70","97","91","13","51","43","67","65","29","11","57","7","54","14","94","52","78","18","41","62","25","60","55","72","35","36","1","32","69","53","3","2","10","40","83","45", "30"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_mt.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_mt_Age.sid
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_mt_synonymsOf_Rather_not_say_Age_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_mt_values_Age_group]
for_each = toset(["X"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_mt.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_mt_Age.sid
synonym_of = "${local.strings_mt["Rather not say"]}"
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_v1" "chatbot_mt_Feeling" {
unique_name = "Feeling"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_mt.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_mt_values_Feeling_group" {
for_each = toset(["${local.strings_mt["Rather not say"]}","${local.strings_mt["Happy"]}","${local.strings_mt["Confused"]}","${local.strings_mt["Angry"]}","${local.strings_mt["Shocked"]}","${local.strings_mt["Uncertain"]}","${local.strings_mt["Scared"]}"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_mt.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_mt_Feeling.sid
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_mt_synonymsOf_Rather_not_say_Feeling_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_mt_values_Feeling_group]
for_each = toset(["x"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_mt.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_mt_Feeling.sid
synonym_of = "${local.strings_mt["Rather not say"]}"
value = each.key
language = "en-US"
}



resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_mt_synonymsOf_Happy_Feeling_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_mt_values_Feeling_group]
for_each = toset(["1"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_mt.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_mt_Feeling.sid
synonym_of = "${local.strings_mt["Happy"]}"
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_mt_synonymsOf_Confused_Feeling_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_mt_values_Feeling_group]
for_each = toset(["2"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_mt.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_mt_Feeling.sid
synonym_of = "${local.strings_mt["Confused"]}"
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_mt_synonymsOf_Angry_Feeling_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_mt_values_Feeling_group]
for_each = toset(["3"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_mt.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_mt_Feeling.sid
synonym_of = "${local.strings_mt["Angry"]}"
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_mt_synonymsOf_Shocked_Feeling_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_mt_values_Feeling_group]
for_each = toset(["4"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_mt.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_mt_Feeling.sid
synonym_of = "${local.strings_mt["Shocked"]}"
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_mt_synonymsOf_Scared_Feeling_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_mt_values_Feeling_group]
for_each = toset(["5"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_mt.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_mt_Feeling.sid
synonym_of = "${local.strings_mt["Scared"]}"
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_mt_synonymsOf_Uncertain_Feeling_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_mt_values_Feeling_group]
for_each = toset(["6"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_mt.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_mt_Feeling.sid
synonym_of = "${local.strings_mt["Uncertain"]}"
value = each.key
language = "en-US"
}
