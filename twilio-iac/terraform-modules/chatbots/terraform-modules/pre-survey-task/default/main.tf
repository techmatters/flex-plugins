terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }
}

resource "twilio_autopilot_assistants_tasks_v1" "survey" {
  unique_name = "survey"
  assistant_sid = var.bot_sid
  actions = jsonencode({
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
