//Pre Survey
resource "twilio_autopilot_assistants_v1" "pre_survey" {
  unique_name       = "demo_chatbot"
}

//Post Survey
resource "twilio_autopilot_assistants_v1" "post_survey" {
  unique_name       = "post_survey_bot"
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
          "uri" : "https://serverless-9907-production.twil.io/autopilotRedirect"
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

resource "twilio_autopilot_assistants_tasks_samples_v1" "goodbye_us_1" {
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey.sid
  task_sid = twilio_autopilot_assistants_tasks_v1.goodbye.sid
  language = "en-US"
  tagged_text = "no thanks"
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "goodbye_us_2" {
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey.sid
  task_sid = twilio_autopilot_assistants_tasks_v1.goodbye.sid
  language = "en-US"
  tagged_text = "that is all thank you"
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "goodbye_us_3" {
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey.sid
  task_sid = twilio_autopilot_assistants_tasks_v1.goodbye.sid
  language = "en-US"
  tagged_text = "that's all for today"
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "goodbye_us_4" {
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey.sid
  task_sid = twilio_autopilot_assistants_tasks_v1.goodbye.sid
  language = "en-US"
  tagged_text = "go away"
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "goodbye_us_5" {
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey.sid
  task_sid = twilio_autopilot_assistants_tasks_v1.goodbye.sid
  language = "en-US"
  tagged_text = "that would be all thanks"
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "goodbye_us_6" {
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey.sid
  task_sid = twilio_autopilot_assistants_tasks_v1.goodbye.sid
  language = "en-US"
  tagged_text = "no"
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "goodbye_us_7" {
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey.sid
  task_sid = twilio_autopilot_assistants_tasks_v1.goodbye.sid
  language = "en-US"
  tagged_text = "no thanks"
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "goodbye_us_8" {
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey.sid
  task_sid = twilio_autopilot_assistants_tasks_v1.goodbye.sid
  language = "en-US"
  tagged_text = "that would be all"
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "goodbye_us_9" {
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey.sid
  task_sid = twilio_autopilot_assistants_tasks_v1.goodbye.sid
  language = "en-US"
  tagged_text = "goodbye"
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "goodbye_us_10" {
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey.sid
  task_sid = twilio_autopilot_assistants_tasks_v1.goodbye.sid
  language = "en-US"
  tagged_text = "goodnight"
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "goodbye_us_11" {
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey.sid
  task_sid = twilio_autopilot_assistants_tasks_v1.goodbye.sid
  language = "en-US"
  tagged_text = "cancel"
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "goodbye_us_12" {
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey.sid
  task_sid = twilio_autopilot_assistants_tasks_v1.goodbye.sid
  language = "en-US"
  tagged_text = "good bye"
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "goodbye_us_13" {
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey.sid
  task_sid = twilio_autopilot_assistants_tasks_v1.goodbye.sid
  language = "en-US"
  tagged_text = "stop talking"
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "goodbye_us_14" {
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey.sid
  task_sid = twilio_autopilot_assistants_tasks_v1.goodbye.sid
  language = "en-US"
  tagged_text = "stop"
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "goodbye_us_15" {
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey.sid
  task_sid = twilio_autopilot_assistants_tasks_v1.goodbye.sid
  language = "en-US"
  tagged_text = "see ya"
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "goodbye_us_16" {
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey.sid
  task_sid = twilio_autopilot_assistants_tasks_v1.goodbye.sid
  language = "en-US"
  tagged_text = "bye bye"
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "goodbye_us_17" {
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey.sid
  task_sid = twilio_autopilot_assistants_tasks_v1.goodbye.sid
  language = "en-US"
  tagged_text = "that's all"
}