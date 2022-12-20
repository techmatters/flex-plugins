resource "twilio_autopilot_assistants_v1" "chatbot_ukr" {
unique_name = "chatbot_ukr"
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
                "speech": "${local.strings_ukr["I didn't get that. What did you say?"]}"
              }
            },
            {
              "say": {
                "speech": "${local.strings_ukr["I still didn't catch that. Please repeat."]}"
              }
            },
            {
              "say": {
                "speech": "${local.strings_ukr["Let's try one last time. Say it again please."]}"
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

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_ukr_survey" {
unique_name = "survey"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_ukr.sid
actions = jsonencode(
{
	"actions": [
		{
			"remember": {
				"at": "survey"
			}
		},
		{
			"say": "${local.strings_ukr["Thank you. You can say 'Rather not say' (or type X) to any question"]}"
		},
		{
			"collect": {
				"name": "collect_survey",
				"questions": [
					{
						"question": "${local.strings_ukr["Provide a Nickname"]}",
						"name": "nickname",
						"type": "Twilio.FIRST_NAME",
						"validate": {
							"on_failure": {
								"messages": [
									{
										"say": "${local.strings_ukr["Sorry, I didn't understand that. Please respond with a name."]}"
									},
									{
										"say": "${local.strings_ukr["Sorry, I still didn't get that."]}"
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
						"question": "${local.strings_ukr["How old are you?"]}",
						"name": "age",
						"type": "Age",
						"validate": {
							"on_failure": {
								"messages": [
									{
										"say": "${local.strings_ukr["Sorry, I didn't understand that. Please respond with a number."]}"
									},
									{
										"say": "${local.strings_ukr["Sorry, I still didn't get that."]}"
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
						"question": "${local.strings_ukr["What is your gender?"]}",
						"name": "gender",
						"type": "Gender",
						"validate": {
							"on_failure": {
								"messages": [
									{
										"say": "${local.strings_ukr["Sorry, I didn't understand that. Please try again."]}"
									},
									{
										"say": "${local.strings_ukr["Sorry, I still didn't get that."]}"
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
						"question": "${local.strings_ukr["How are you feeling?"]}",
						"name": "feeling",
						"type": "Feeling",
						"validate": {
							"on_failure": {
								"messages": [
									{
										"say": "${local.strings_ukr["Sorry, I didn't understand that. Please try again."]}"
									},
									{
										"say": "${local.strings_ukr["Sorry, I still didn't get that."]}"
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
						"question": "${local.strings_ukr["Do you accept our Terms and Conditions?"]}",
						"name": "terms_conditions",
						"type": "YesNo",
						"validate": {
							"on_failure": {
								"messages": [
									{
										"say": "${local.strings_ukr["Sorry, I didn't understand that. Please try again."]}"
									},
									{
										"say": "${local.strings_ukr["Sorry, I still didn't get that."]}"
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

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_ukr_redirect_function" {
unique_name = "redirect_function"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_ukr.sid
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

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_ukr_survey_start" {
unique_name = "survey_start"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_ukr.sid
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
						"question": "${local.strings_ukr["Are you calling about yourself?"]}",
						"name": "about_self",
						"type": "YesNo",
						"validate": {
							"on_failure": {
								"messages": [
									{
										"say": "${local.strings_ukr["Sorry, I didn't understand that. Please try again."]}"
									},
									{
										"say": "${local.strings_ukr["Sorry, I still didn't get that."]}"
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

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_ukr_collect_fallback" {
unique_name = "collect_fallback"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_ukr.sid
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


resource "twilio_autopilot_assistants_tasks_v1" "chatbot_ukr_counselor_handoff" {
unique_name = "counselor_handoff"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_ukr.sid
actions = jsonencode({
	"actions": [
		{
			"remember": {
				"at": "counselor_handoff",
				"sendToAgent": true
			}
		},
		{
			"say": "${local.strings_ukr["We'll transfer you now, please hold for a support mentor."]}"
		}
	]
})
}

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_ukr_fallback" {
unique_name = "fallback"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_ukr.sid
actions = jsonencode({
  "actions": [
    {
      "say": "${local.strings_ukr["Sorry, I didn't understand that. Please try again."]}"
    },
    {
      "listen": true
    }
  ]
})
}

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_ukr_goodbye" {
unique_name = "goodbye"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_ukr.sid
actions = jsonencode({
  "actions": [
    {
      "say": "${local.strings_ukr["Thank you! Goodbye."]}"
    }
  ]
})
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "chatbot_ukr_goodbye_group" {
for_each = toset(["${local.strings_ukr["goodbye"]}","${local.strings_ukr["stop"]}"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_ukr.sid
task_sid      = twilio_autopilot_assistants_tasks_v1.chatbot_ukr_goodbye.sid
language = "en-US"
tagged_text = each.key
}

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_ukr_greeting" {
unique_name = "greeting"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_ukr.sid
actions = jsonencode({
	"actions": [
		{
			"remember": {
				"at": "greeting"
			}
		},
		{
			"say": "${local.strings_ukr["Welcome"]}"
		},
		{
			"redirect": "task://survey_start"
		}
	]
})
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "chatbot_ukr_greeting_group" {
for_each = toset(["${local.strings_ukr["hello"]}","${local.strings_ukr["hi"]}"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_ukr.sid
task_sid = twilio_autopilot_assistants_tasks_v1.chatbot_ukr_greeting.sid
language = "en-US"
tagged_text = each.key
}

resource "twilio_autopilot_assistants_field_types_v1" "chatbot_ukr_YesNo" {
unique_name = "YesNo"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_ukr.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_ukr_values_YesNo_group" {
for_each = toset(["${local.strings_ukr["No"]}","${local.strings_ukr["Yes"]}"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_ukr.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_ukr_YesNo.sid
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_ukr_synonymsOf_No_YesNo_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_ukr_values_YesNo_group]
for_each = toset(["${local.strings_ukr["Nope"]}"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_ukr.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_ukr_YesNo.sid
synonym_of = "${local.strings_ukr["No"]}"
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_ukr_synonymsOf_Yes_YesNo_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_ukr_values_YesNo_group]
for_each = toset(["${local.strings_ukr["Yeah"]}"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_ukr.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_ukr_YesNo.sid
synonym_of = "${local.strings_ukr["Yes"]}"
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_v1" "chatbot_ukr_Gender" {
unique_name = "Gender"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_ukr.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_ukr_values_Gender_group" {
for_each = toset(["${local.strings_ukr["Rather not say"]}","${local.strings_ukr["Others"]}","${local.strings_ukr["Female"]}","${local.strings_ukr["Male"]}"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_ukr.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_ukr_Gender.sid
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_ukr_synonymsOf_Rather_not_say_Gender_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_ukr_values_Gender_group]
for_each = toset(["x","4"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_ukr.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_ukr_Gender.sid
synonym_of = "${local.strings_ukr["Rather not say"]}"
value = each.key
language = "en-US"
}



resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_ukr_synonymsOf_Female_Gender_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_ukr_values_Gender_group]
for_each = toset(["${local.strings_ukr["girl"]}","1"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_ukr.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_ukr_Gender.sid
synonym_of = "${local.strings_ukr["Female"]}"
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_ukr_synonymsOf_Male_Gender_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_ukr_values_Gender_group]
for_each = toset(["${local.strings_ukr["boy"]}","2"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_ukr.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_ukr_Gender.sid
synonym_of = "${local.strings_ukr["Male"]}"
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_ukr_synonymsOf_Others_Gender_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_ukr_values_Gender_group]
for_each = toset(["3"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_ukr.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_ukr_Gender.sid
synonym_of = "${local.strings_ukr["Others"]}"
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_v1" "chatbot_ukr_Age" {
unique_name = "Age"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_ukr.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_ukr_values_Age_group" {
for_each = toset(["${local.strings_ukr["Rather not say"]}","89","88","31","61","86","47","5","92","63","24","42","9","50","75","66","58","74","48","85","39","84","87","76","38","21","8","49","17","59","96","34","26","27","28","73","22","77","79","23","64","71","82","46","98","100","68","81","16","19","95","20","44","6","37","4","99","56","90","33","12","93","15","80","70","97","91","13","51","43","67","65","29","11","57","7","54","14","94","52","78","18","41","62","25","60","55","72","35","36","1","32","69","53","3","2","10","40","83","45", "30"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_ukr.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_ukr_Age.sid
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_ukr_synonymsOf_Rather_not_say_Age_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_ukr_values_Age_group]
for_each = toset(["X"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_ukr.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_ukr_Age.sid
synonym_of = "${local.strings_ukr["Rather not say"]}"
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_v1" "chatbot_ukr_Feeling" {
unique_name = "Feeling"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_ukr.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_ukr_values_Feeling_group" {
for_each = toset(["${local.strings_ukr["Rather not say"]}","${local.strings_ukr["Happy"]}","${local.strings_ukr["Confused"]}","${local.strings_ukr["Angry"]}","${local.strings_ukr["Shocked"]}","${local.strings_ukr["Uncertain"]}","${local.strings_ukr["Scared"]}"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_ukr.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_ukr_Feeling.sid
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_ukr_synonymsOf_Rather_not_say_Feeling_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_ukr_values_Feeling_group]
for_each = toset(["x"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_ukr.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_ukr_Feeling.sid
synonym_of = "${local.strings_ukr["Rather not say"]}"
value = each.key
language = "en-US"
}



resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_ukr_synonymsOf_Happy_Feeling_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_ukr_values_Feeling_group]
for_each = toset(["1"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_ukr.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_ukr_Feeling.sid
synonym_of = "${local.strings_ukr["Happy"]}"
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_ukr_synonymsOf_Confused_Feeling_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_ukr_values_Feeling_group]
for_each = toset(["2"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_ukr.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_ukr_Feeling.sid
synonym_of = "${local.strings_ukr["Confused"]}"
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_ukr_synonymsOf_Angry_Feeling_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_ukr_values_Feeling_group]
for_each = toset(["3"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_ukr.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_ukr_Feeling.sid
synonym_of = "${local.strings_ukr["Angry"]}"
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_ukr_synonymsOf_Shocked_Feeling_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_ukr_values_Feeling_group]
for_each = toset(["4"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_ukr.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_ukr_Feeling.sid
synonym_of = "${local.strings_ukr["Shocked"]}"
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_ukr_synonymsOf_Scared_Feeling_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_ukr_values_Feeling_group]
for_each = toset(["5"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_ukr.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_ukr_Feeling.sid
synonym_of = "${local.strings_ukr["Scared"]}"
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_ukr_synonymsOf_Uncertain_Feeling_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_ukr_values_Feeling_group]
for_each = toset(["6"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_ukr.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_ukr_Feeling.sid
synonym_of = "${local.strings_ukr["Uncertain"]}"
value = each.key
language = "en-US"
}
