//Pre Survey
resource "twilio_autopilot_assistants_v1" "pre_survey" {
  unique_name       = "demo_chatbot"
  friendly_name     = "A bot that collects a pre-survey"
  style_sheet       = jsonencode({
    "style_sheet" : {
      "collect" : {
        "validate" : {
          "on_failure" : {
            "repeat_question" : false,
            "messages" : [
              {
                "say" : {
                  "speech" : "I didn't get that. What did you say?"
                }
              },
              {
                "say" : {
                  "speech" : "I still didn't catch that. Please repeat."
                }
              },
              {
                "say" : {
                  "speech" : "Let's try one last time. Say it again please."
                }
              }
            ]
          },
          "on_success" : { "say" : { "speech" : "" } },
          "max_attempts" : 4
        }
      },
      "voice" : {
        "say_voice" : "Polly.Matthew"
      },
      "name" : ""
    }
  })
  defaults          = jsonencode({
    "defaults" : {
      "assistant_initiation" : "task://greeting",
      "fallback" : "task://fallback",
      "collect" : {
        "validate_on_failure" : "task://collect_fallback"
      }
    }
  })
  log_queries = true
}

//Post Survey
resource "twilio_autopilot_assistants_v1" "post_survey" {
  unique_name       = "post_survey_bot"
  friendly_name     = "A bot that collects a pre-survey"
  log_queries = true
}

resource "twilio_autopilot_assistants_tasks_v1" "survey" {
  unique_name   = "survey"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey.sid
  actions       = jsonencode({
    "actions" : [
      {
        "remember" : { "at" : "survey" }
      },
      {
        "say" : "Thank you. You can say 'prefer not to answer' (or type X) to any question."
      },
      {
        "collect" : {
          "on_complete" : {
            "redirect" : "task://redirect_function"
          },
          "name" : "collect_survey",
          "questions" : [
            {
              "type" : "Age",
              "validate" : {
                "on_failure" : {
                  "repeat_question" : true,
                  "messages" : [
                    {
                      "say" : "Sorry, I didn't understand that. Please respond with a number."
                    },
                    {
                      "say" : "Sorry, I still didn't get that."
                    }
                  ]
                },
                "max_attempts" : {
                  "redirect" : "task://redirect_function",
                  "num_attempts" : 2
                }
              },
              "question" : "How old are you?",
              "name" : "age"
            },
            {
              "type" : "Gender",
              "validate" : {
                "on_failure" : {
                  "repeat_question" : true,
                  "messages" : [
                    {
                      "say" : "Sorry, I didn't understand that. Please try again."
                    },
                    {
                      "say" : "Sorry, I still didn't get that."
                    }
                  ]
                },
                "max_attempts" : {
                  "redirect" : "task://redirect_function",
                  "num_attempts" : 2
                }
              },
              "question" : "What is your gender?",
              "name" : "gender"
            }
          ]
        }
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "redirect_function" {
  unique_name = "redirect_function"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey.sid
  actions = jsonencode({
    "actions" : [
      {
        "redirect" : {
          "method" : "POST",
          "uri" : "${var.serverless_url}/autopilotRedirect"
        }
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "gender_why" {
  unique_name = "gender_why"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey.sid
  actions = jsonencode({
    "actions" : [
      {
        "remember" : { "at" : "gender_why" }
      },
      {
        "collect" : {
          "on_complete" : {
            "redirect" : "task://redirect_function"
          },
          "name" : "collect_survey",
          "questions" : [
            {
              "type" : "Gender",
              "validate" : {
                "on_failure" : {
                  "messages" : [{ "say" : "Got it." }]
                },
                "max_attempts" : {
                  "redirect" : "task://redirect_function",
                  "num_attempts" : 1
                },
                "allowed_values" : {
                  "list" : [
                    "Boy",
                    "Girl",
                    "Non-binary"
                  ]
                }
              },
              "question" : "We ask for gender--whether you identify as a boy, girl, or neither--to help understand who is using our helpline. If you're uncomfortable answering, just say 'prefer not to answer.'",
              "name" : "gender"
            }
          ]
        }
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "survey_start" {
  unique_name = "survey_start"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey.sid
  actions = jsonencode({
    "actions" : [
      {
        "remember" : { "at" : "survey_start" }
      },
      {
        "collect" : {
          "on_complete" : {
            "redirect" : "task://survey"
          },
          "name" : "collect_survey",
          "questions" : [
            {
              "type" : "Twilio.YES_NO",
              "validate" : {
                "on_failure" : {
                  "repeat_question" : true,
                  "messages" : [
                    {
                      "say" : "Sorry, I didn't understand that."
                    },
                    {
                      "say" : "I still didn't get that."
                    }
                  ]
                },
                "max_attempts" : {
                  "redirect" : "task://redirect_function",
                  "num_attempts" : 2
                }
              },
              "question" : "Are you calling about yourself? Please answer Yes or No.",
              "name" : "about_self"
            }
          ]
        }
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "counselor_handoff" {
  unique_name   = "counselor_handoff"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey.sid
  actions       = jsonencode({
    "actions" : [
      {
        "remember" : {
          "sendToAgent" : true,
          "at" : "counselor_handoff"
        }
      },
      {
        "say" : "We'll transfer you now. Please hold for a counsellor."
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "fallback" {
  unique_name   = "fallback"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey.sid
  actions       = jsonencode({
    "actions" : [
      {
        "say" : "I'm sorry didn't quite get that. Please try that again."
      },
      { "listen" : true }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "greeting" {
  unique_name   = "greeting"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey.sid
  actions       = jsonencode({
    "actions" : [
      {
        "remember" : { "at" : "greeting" }
      },
      {
        "say" : "Welcome to the helpline. To help us better serve you, please answer the following three questions."
      },
      {
        "redirect" : "task://survey_start"
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "greeting_group" {
  for_each = toset(["hi!", "hi there", "good afternoon", "good morning", "heya", "Hi", "Hello.", "hey", "hi there.", "hello", "what'us up", "what do you do", "what can you do", "whatsup", "sup", "yo"])
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey.sid
  task_sid = twilio_autopilot_assistants_tasks_v1.greeting.sid
  language = "en-US"
  tagged_text = each.key
}

resource "twilio_autopilot_assistants_tasks_v1" "collect_fallback" {
  unique_name   = "collect_fallback"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey.sid
  actions       = jsonencode({
    "actions" : [
      {
        "say" : "Looks like I'm having trouble. Apologies for that. Let's start again, how can I help you today?"
      },
      { "listen" : true }
    ]
  })
}


resource "twilio_autopilot_assistants_tasks_v1" "goodbye" {
  unique_name   = "goodbye"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey.sid
  actions       = jsonencode({
    "actions" : [
      {
        "say" : "Thank you! Please reach out again if you need anything. Goodbye."
      }
    ]
  })
}


resource "twilio_autopilot_assistants_tasks_samples_v1" "goodbye_group" {
  for_each = toset(["no thanks", "that is all thank you", "that's all for today", "go away", "that would be all thanks", "no", "no thanks", "that would be all", "goodbye", "goodnight", "cancel", "good bye", "stop talking", "stop", "see ya", "bye bye", "that's all"])
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey.sid
  task_sid = twilio_autopilot_assistants_tasks_v1.goodbye.sid
  language = "en-US"
  tagged_text = each.key
}

resource "twilio_autopilot_assistants_field_types_v1" "age" {
  unique_name = "Age"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "number_age_group" {
  for_each = toset(["1", "2", "3", "4", "5", "6", "7", "8", "9",
    "10", "11", "12", "13", "14", "15", "16", "17", "18", "19"
  , "20", "21", "22", "23", "24", "25", "26", "27", "28", "29"
  , "10", "31", "32", "33", "34", "35", "36", "37", "38", "39"
  , "40", "41", "42", "43", "44", "45", "46", "47", "48", "49"
  , "50", "51", "52", "53", "54", "55", "56", "57", "58", "59"
  , "60", "61", "62", "63", "64", "65", "66", "67", "68", "69"
  , "70", "71", "72", "73", "74", "75", "76", "77", "78", "79"
  , "80", "81", "82", "83", "84", "85", "86", "87", "88", "89"
  , "90", "91", "92", "93", "94", "95", "96", "97", "98", "99"
  , "100", "Unknown"])
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.age.sid
  value = each.key
  language = "en-US"
}
resource "twilio_autopilot_assistants_field_types_field_values_v1" "unknown_age_group" {
  depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.number_age_group] //Synonym creation fails if not created after what they alias
  for_each = toset(["Prefer not to answer", "X", "prefer not", "prefer not to"])
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.age.sid
  value = each.key
  language = "en-US"
  synonym_of = "Unknown"
}

resource "twilio_autopilot_assistants_field_types_v1" "gender" {
  unique_name = "Gender"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "gender_group" {
  for_each = toset(["Boy", "Girl", "Unknown", "Non-Binary"])
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.gender.sid
  value = each.key
  language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "gender_boy_synonym_group" {
  depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.gender_group] //Synonym creation fails if not created after what they alias
  for_each = toset(["male", "man", "M", "guy", "dude", "males", "B"])
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.gender.sid
  value = each.key
  language = "en-US"
  synonym_of = "Boy"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "gender_girl_synonym_group" {
  depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.gender_group] //Synonym creation fails if not created after what they alias
  for_each = toset(["female", "woman", "F", "W", "lady", "females", "G"])
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.gender.sid
  value = each.key
  language = "en-US"
  synonym_of = "Girl"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "gender_unknown_synonym_group" {
  depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.gender_group] //Synonym creation fails if not created after what they alias
  for_each = toset(["prefer not to answer", "X", "none of your business", "prefer not", "prefer not to"])
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.gender.sid
  value = each.key
  language = "en-US"
  synonym_of = "Unknown"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "gender_nonbinary_synonym_group" {
  depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.gender_group] //Synonym creation fails if not created after what they alias
  for_each = toset(["NB", "agender", "nonbinary", "non binary"])
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.gender.sid
  value = each.key
  language = "en-US"
  synonym_of = "Non-Binary"
}