resource "twilio_autopilot_assistants_v1" "preSurvey_en_v2" {
  unique_name   = "preSurvey_en_v2"
  friendly_name = "A bot that collects a pre-survey"
  style_sheet = jsonencode({
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
          "on_success" : {
            "say" : {
              "speech" : ""
            }
          },
          "max_attempts" : 4
        }
      },
      "voice" : {
        "say_voice" : "Polly.Matthew"
      },
      "name" : ""
    }
  })
  defaults = jsonencode({
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

resource "twilio_autopilot_assistants_tasks_v1" "preSurvey_en_v2_survey" {
  unique_name   = "survey"
  assistant_sid = twilio_autopilot_assistants_v1.preSurvey_en_v2.sid
  actions = jsonencode({
    "actions" : [
      {
        "remember" : {
          "at" : "survey"
        }
      },
      {
        "say" : "You can say 'prefer not to answer' (or type X) to any question."
      },
      {
        "collect" : {
          "on_complete" : {
            "redirect" : "task://redirect_function"
          },
          "name" : "collect_survey",
          "questions" : [
            {
              "type" : "CSAM",
              "validate" : {
                "on_failure" : {
                  "repeat_question" : true,
                  "messages" : [
                    {
                      "say" : "Sorry, I didn't understand that."
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
              "question" : "Are you reporting a child sexual abuse material (CSAM) or Incident of Sexual Exploitation? Respond 1 to report and 2 if you are not reporting.",
              "name" : "csam"
            },
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
              "question" : "How old are you? Please enter a number",
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
              "question" : "What is your gender? Please enter Male, Female, LGBTQ+",
              "name" : "gender"
            },
            {
              "type" : "CGender",
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
              "question" : "Do you have a counselor preference? 1. Male counselor 2. Female counselor 3. Non-binary 4. No preference",
              "name" : "cgender"
            }
          ]
        }
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "preSurvey_en_v2_collect_fallback" {
  unique_name   = "collect_fallback"
  assistant_sid = twilio_autopilot_assistants_v1.preSurvey_en_v2.sid
  actions = jsonencode({
    "actions" : [
      {
        "say" : "Looks like I'm having trouble. Apologies for that. Let's start again, how can I help you today?"
      },
      {
        "listen" : true
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "preSurvey_en_v2_counselor_handoff" {
  unique_name   = "counselor_handoff"
  assistant_sid = twilio_autopilot_assistants_v1.preSurvey_en_v2.sid
  actions = jsonencode({
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

resource "twilio_autopilot_assistants_tasks_v1" "preSurvey_en_v2_fallback" {
  unique_name   = "fallback"
  assistant_sid = twilio_autopilot_assistants_v1.preSurvey_en_v2.sid
  actions = jsonencode({
    "actions" : [
      {
        "say" : "I'm sorry didn't quite get that. Please try that again."
      },
      {
        "listen" : true
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "preSurvey_en_v2_survey_start" {
  unique_name   = "survey_start"
  assistant_sid = twilio_autopilot_assistants_v1.preSurvey_en_v2.sid
  actions = jsonencode({
    "actions" : [
      {
        "remember" : {
          "at" : "survey_start"
        }
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
              "question" : "Are you reporting about yourself? Please answer Yes or No.",
              "name" : "about_self"
            }
          ]
        }
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "preSurvey_en_v2_gender_why" {
  unique_name   = "gender_why"
  assistant_sid = twilio_autopilot_assistants_v1.preSurvey_en_v2.sid
  actions = jsonencode({
    "actions" : [
      {
        "remember" : {
          "at" : "gender_why"
        }
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
                  "messages" : [
                    {
                      "say" : "Got it."
                    }
                  ]
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

resource "twilio_autopilot_assistants_tasks_v1" "preSurvey_en_v2_redirect_function" {
  unique_name   = "redirect_function"
  assistant_sid = twilio_autopilot_assistants_v1.preSurvey_en_v2.sid
  actions = jsonencode({
    "actions" : [
      {
        "redirect" : {
          "method" : "POST",
          "uri" : "${module.serverless.serverless_environment_production_url}/autopilotRedirect"
        }
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "preSurvey_en_v2_greeting" {
  unique_name   = "greeting"
  assistant_sid = twilio_autopilot_assistants_v1.preSurvey_en_v2.sid
  actions = jsonencode({
    "actions" : [
      {
        "remember" : {
          "at" : "greeting"
        }
      },
      {
        "redirect" : "task://survey_start"
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "preSurvey_en_v2_greeting_group" {
  for_each      = toset(["Hi", "Hello.", "sup", "hi there", "hey", "good afternoon", "yo", "what can you do", "whatsup", "good morning", "what do you do", "hi!", "hello", "hi there.", "what'us up", "heya"])
  assistant_sid = twilio_autopilot_assistants_v1.preSurvey_en_v2.sid
  task_sid      = twilio_autopilot_assistants_tasks_v1.preSurvey_en_v2_greeting.sid
  language      = "en-US"
  tagged_text   = each.key
}

resource "twilio_autopilot_assistants_tasks_v1" "preSurvey_en_v2_goodbye" {
  unique_name   = "goodbye"
  assistant_sid = twilio_autopilot_assistants_v1.preSurvey_en_v2.sid
  actions = jsonencode({
    "actions" : [
      {
        "say" : "Thank you! Please reach out again if you need anything. Goodbye."
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "preSurvey_en_v2_goodbye_group" {
  for_each      = toset(["that's all", "go away", "see ya", "goodnight", "cancel", "no", "that is all thank you", "that's all for today", "that would be all", "no thanks", "good bye", "bye bye", "stop", "that would be all thanks", "stop talking", "goodbye"])
  assistant_sid = twilio_autopilot_assistants_v1.preSurvey_en_v2.sid
  task_sid      = twilio_autopilot_assistants_tasks_v1.preSurvey_en_v2_goodbye.sid
  language      = "en-US"
  tagged_text   = each.key
}

resource "twilio_autopilot_assistants_field_types_v1" "preSurvey_en_v2_CSAM" {
  unique_name   = "CSAM"
  assistant_sid = twilio_autopilot_assistants_v1.preSurvey_en_v2.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "preSurvey_en_v2_values_CSAM_group" {
  for_each       = toset(["Unknown", "No_CSAM", "CSAM"])
  assistant_sid  = twilio_autopilot_assistants_v1.preSurvey_en_v2.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.preSurvey_en_v2_CSAM.sid
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "preSurvey_en_v2_synonymsOf_Unknown_CSAM_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.preSurvey_en_v2_values_CSAM_group]
  for_each       = toset(["x"])
  assistant_sid  = twilio_autopilot_assistants_v1.preSurvey_en_v2.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.preSurvey_en_v2_CSAM.sid
  synonym_of     = "Unknown"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "preSurvey_en_v2_synonymsOf_No_CSAM_CSAM_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.preSurvey_en_v2_values_CSAM_group]
  for_each       = toset(["not reporting", "no", "2"])
  assistant_sid  = twilio_autopilot_assistants_v1.preSurvey_en_v2.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.preSurvey_en_v2_CSAM.sid
  synonym_of     = "No_CSAM"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "preSurvey_en_v2_synonymsOf_CSAM_CSAM_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.preSurvey_en_v2_values_CSAM_group]
  for_each       = toset(["report", "report csam", "yes", "1"])
  assistant_sid  = twilio_autopilot_assistants_v1.preSurvey_en_v2.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.preSurvey_en_v2_CSAM.sid
  synonym_of     = "CSAM"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_v1" "preSurvey_en_v2_CGender" {
  unique_name   = "CGender"
  assistant_sid = twilio_autopilot_assistants_v1.preSurvey_en_v2.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "preSurvey_en_v2_values_CGender_group" {
  for_each       = toset(["None", "Non-binary", "Male", "Female"])
  assistant_sid  = twilio_autopilot_assistants_v1.preSurvey_en_v2.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.preSurvey_en_v2_CGender.sid
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "preSurvey_en_v2_synonymsOf_Male_CGender_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.preSurvey_en_v2_values_CGender_group]
  for_each       = toset(["1", "guy", "boy", "M"])
  assistant_sid  = twilio_autopilot_assistants_v1.preSurvey_en_v2.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.preSurvey_en_v2_CGender.sid
  synonym_of     = "Male"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "preSurvey_en_v2_synonymsOf_Female_CGender_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.preSurvey_en_v2_values_CGender_group]
  for_each       = toset(["2", "lady", "girl", "F"])
  assistant_sid  = twilio_autopilot_assistants_v1.preSurvey_en_v2.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.preSurvey_en_v2_CGender.sid
  synonym_of     = "Female"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "preSurvey_en_v2_synonymsOf_Non-binary_CGender_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.preSurvey_en_v2_values_CGender_group]
  for_each       = toset(["3", "questioning", "transexual", "bisexual", "lesbian", "gay", "lgbtq"])
  assistant_sid  = twilio_autopilot_assistants_v1.preSurvey_en_v2.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.preSurvey_en_v2_CGender.sid
  synonym_of     = "Non-binary"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "preSurvey_en_v2_synonymsOf_None_CGender_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.preSurvey_en_v2_values_CGender_group]
  for_each       = toset(["4", "X", "any", "don't matter", "doesn't matter", "No preference"])
  assistant_sid  = twilio_autopilot_assistants_v1.preSurvey_en_v2.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.preSurvey_en_v2_CGender.sid
  synonym_of     = "None"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_v1" "preSurvey_en_v2_Age" {
  unique_name   = "Age"
  assistant_sid = twilio_autopilot_assistants_v1.preSurvey_en_v2.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "preSurvey_en_v2_values_Age_group" {
  for_each       = toset(["37", "40", "71", "55", "57", "47", "36", "53", "49", "84", "28", "17", "14", "27", "3", "35", "87", "88", "92", "82", "9", "50", "18", "75", "59", "58", "38", "94", "13", "20", "96", "42", "4", "95", "25", "21", "98", "7", "66", "2", "8", "91", "26", "74", "45", "81", "11", "99", "19", "31", "39", "46", "16", "67", "100", "85", "93", "44", "32", "72", "86", "Unknown", "48", "12", "22", "23", "1", "62", "83", "78", "77", "33", "76", "24", "68", "70", "29", "5", "65", "51", "10", "63", "69", "61", "43", "89", "41", "6", "79", "97", "52", "80", "64", "56", "73", "34", "15", "90", "54", "60"])
  assistant_sid  = twilio_autopilot_assistants_v1.preSurvey_en_v2.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.preSurvey_en_v2_Age.sid
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "preSurvey_en_v2_synonymsOf_Unknown_Age_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.preSurvey_en_v2_values_Age_group]
  for_each       = toset(["prefer not", "Prefer not to answer", "prefer not to", "X"])
  assistant_sid  = twilio_autopilot_assistants_v1.preSurvey_en_v2.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.preSurvey_en_v2_Age.sid
  synonym_of     = "Unknown"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_v1" "preSurvey_en_v2_Gender" {
  unique_name   = "Gender"
  assistant_sid = twilio_autopilot_assistants_v1.preSurvey_en_v2.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "preSurvey_en_v2_values_Gender_group" {
  for_each       = toset(["Unknown", "Non-Binary", "Girl", "Boy"])
  assistant_sid  = twilio_autopilot_assistants_v1.preSurvey_en_v2.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.preSurvey_en_v2_Gender.sid
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "preSurvey_en_v2_synonymsOf_Non-Binary_Gender_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.preSurvey_en_v2_values_Gender_group]
  for_each       = toset(["trans sexual", "trans", "bisexual", "bi", "gay", "lesbian", "lgbtq", "lgbtq+", "q", "t", "l", "NB", "non binary", "nonbinary", "agender"])
  assistant_sid  = twilio_autopilot_assistants_v1.preSurvey_en_v2.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.preSurvey_en_v2_Gender.sid
  synonym_of     = "Non-Binary"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "preSurvey_en_v2_synonymsOf_Boy_Gender_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.preSurvey_en_v2_values_Gender_group]
  for_each       = toset(["dude", "man", "guy", "B", "males", "male", "M"])
  assistant_sid  = twilio_autopilot_assistants_v1.preSurvey_en_v2.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.preSurvey_en_v2_Gender.sid
  synonym_of     = "Boy"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "preSurvey_en_v2_synonymsOf_Unknown_Gender_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.preSurvey_en_v2_values_Gender_group]
  for_each       = toset(["prefer not", "prefer not to", "none of your business", "X", "prefer not to answer"])
  assistant_sid  = twilio_autopilot_assistants_v1.preSurvey_en_v2.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.preSurvey_en_v2_Gender.sid
  synonym_of     = "Unknown"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "preSurvey_en_v2_synonymsOf_Girl_Gender_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.preSurvey_en_v2_values_Gender_group]
  for_each       = toset(["woman", "female", "W", "F", "lady", "females", "G"])
  assistant_sid  = twilio_autopilot_assistants_v1.preSurvey_en_v2.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.preSurvey_en_v2_Gender.sid
  synonym_of     = "Girl"
  value          = each.key
  language       = "en-US"
}
