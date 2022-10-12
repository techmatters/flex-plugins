resource "twilio_autopilot_assistants_v1" "chatbot_default" {
unique_name = "demo_chatbot"
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
                "speech": "I didn't get that. What did you say?"
              }
            },
            {
              "say": {
                "speech": "I still didn't catch that. Please repeat."
              }
            },
            {
              "say": {
                "speech": "Let's try one last time. Say it again please."
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

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_default_survey" {
unique_name = "survey"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_default.sid
actions = jsonencode({
  "actions": [
    {
      "remember": {
        "at": "survey"
      }
    },
    {
      "say": "Köszönöm. Ha nem szeretnél válaszolni, haszáld az x billentyűt"
    },
    {
      "collect": {
        "on_complete": {
          "redirect": "task://redirect_function"
        },
        "name": "collect_survey",
        "questions": [
          {
            "type": "Age",
            "validate": {
              "on_failure": {
                "repeat_question": true,
                "messages": [
                  {
                    "say": "Sajnálom, ezt nem értem. Kérlek, egy számot adj meg."
                  },
                  {
                    "say": "Sajnálom, még mindig nem értem"
                  }
                ]
              },
              "max_attempts": {
                "redirect": "task://redirect_function",
                "num_attempts": 2
              }
            },
            "question": "Hány éves vagy?",
            "name": "age"
          },
          {
            "type": "Gender",
            "validate": {
              "on_failure": {
                "repeat_question": true,
                "messages": [
                  {
                    "say": "Sajnálom, ezt nem értem."
                  },
                  {
                    "say": "Sajnálom, még mindig nem értem"
                  }
                ]
              },
              "max_attempts": {
                "redirect": "task://redirect_function",
                "num_attempts": 2
              }
            },
            "question": "Milyen nemű vagy?",
            "name": "gender"
          }
        ]
      }
    }
  ]
})
}

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_default_redirect_function" {
unique_name = "redirect_function"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_default.sid
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

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_default_survey_start" {
unique_name = "survey_start"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_default.sid
actions = jsonencode({
  "actions": [
    {
      "remember": {
        "at": "survey_start"
      }
    },
    {
      "collect": {
        "on_complete": {
          "redirect": "task://survey"
        },
        "name": "collect_survey",
        "questions": [
          {
            "type": "Self",
            "validate": {
              "on_failure": {
                "repeat_question": true,
                "messages": [
                  {
                    "say": "Sajnálom, ezt nem értem"
                  },
                  {
                    "say": "Sajnálom, még mindig nem értem"
                  }
                ]
              },
              "max_attempts": {
                "redirect": "task://redirect_function",
                "num_attempts": 2
              }
            },
            "question": "Saját ügyedben keresel minket? Kérlek válaszolj igennel vagy nemmel",
            "name": "about_self"
          }
        ]
      }
    }
  ]
})
}

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_default_collect_fallback" {
unique_name = "collect_fallback"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_default.sid
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

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_default_gender_why" {
unique_name = "gender_why"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_default.sid
actions = jsonencode({
  "actions": [
    {
      "remember": {
        "at": "gender_why"
      }
    },
    {
      "collect": {
        "on_complete": {
          "redirect": "task://redirect_function"
        },
        "name": "collect_survey",
        "questions": [
          {
            "type": "Gender",
            "validate": {
              "on_failure": {
                "messages": [
                  {
                    "say": "Got it."
                  }
                ]
              },
              "max_attempts": {
                "redirect": "task://redirect_function",
                "num_attempts": 1
              },
              "allowed_values": {
                "list": [
                  "Boy",
                  "Girl",
                  "Non-binary"
                ]
              }
            },
            "question": "We ask for gender--whether you identify as a boy, girl, or neither--to help understand who is using our helpline. If you're uncomfortable answering, just say 'prefer not to answer.'",
            "name": "gender"
          }
        ]
      }
    }
  ]
})
}

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_default_counselor_handoff" {
unique_name = "counselor_handoff"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_default.sid
actions = jsonencode({
  "actions": [
    {
      "remember": {
        "sendToAgent": true,
        "at": "counselor_handoff"
      }
    },
    {
      "say": "Továbbítunk egy ügyelőhöz, akivel beszélgetni tudsz."
    }
  ]
})
}

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_default_fallback" {
unique_name = "fallback"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_default.sid
actions = jsonencode({
  "actions": [
    {
      "say": "I'm sorry didn't quite get that. Please try that again."
    },
    {
      "listen": true
    }
  ]
})
}

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_default_goodbye" {
unique_name = "goodbye"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_default.sid
actions = jsonencode({
  "actions": [
    {
      "say": "Thank you! Please reach out again if you need anything. Goodbye."
    }
  ]
})
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "chatbot_default_goodbye_group" {
for_each = toset(["goodbye","stop","go away","no thanks","no","that's all","see ya","good bye","bye bye","cancel","stop talking","that's all for today","goodnight","that would be all","that is all thank you","that would be all thanks"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_default.sid
task_sid = twilio_autopilot_assistants_tasks_v1.chatbot_default_goodbye.sid
language = "en-US"
tagged_text = each.key
}

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_default_greeting" {
unique_name = "greeting"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_default.sid
actions = jsonencode({
  "actions": [
    {
      "remember": {
        "at": "greeting"
      }
    },
    {
      "say": "Szia, ez itt a Kék Vonal! Kérlek, válaszolj a következő kérdésekre, hogy jobban tudjunk segíteni Neked."
    },
    {
      "redirect": "task://survey_start"
    }
  ]
})
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "chatbot_default_greeting_group" {
for_each = toset(["what do you do","Hello.","heya","hi there","good morning","whatsup","hey","hello","hi there.","what'us up","yo","hi!","what can you do","good afternoon","sup","Hi"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_default.sid
task_sid = twilio_autopilot_assistants_tasks_v1.chatbot_default_greeting.sid
language = "en-US"
tagged_text = each.key
}

resource "twilio_autopilot_assistants_field_types_v1" "chatbot_default_Self" {
unique_name = "Self"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_default.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_default_values_Self_group" {
for_each = toset(["No","Yes"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_default.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_default_Self.sid
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_default_synonymsOf_No_Self_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_default_values_Self_group]
for_each = toset(["nemme","n","ne","nemm","nemmel","nincs","nem"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_default.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_default_Self.sid
synonym_of = "No"
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_default_synonymsOf_Yes_Self_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_default_values_Self_group]
for_each = toset(["igenn","ige","ig","i","igennel","Igen"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_default.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_default_Self.sid
synonym_of = "Yes"
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_v1" "chatbot_default_Gender" {
unique_name = "Gender"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_default.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_default_values_Gender_group" {
for_each = toset(["Nem derült ki","Nem bináris","Fiú","Lány"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_default.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_default_Gender.sid
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_default_synonymsOf_Nem_derult_ki_Gender_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_default_values_Gender_group]
for_each = toset(["x"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_default.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_default_Gender.sid
synonym_of = "Nem derült ki"
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_default_synonymsOf_Nem_binaris_Gender_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_default_values_Gender_group]
for_each = toset(["nb","nembinaris","nem"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_default.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_default_Gender.sid
synonym_of = "Nem bináris"
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_default_synonymsOf_Lany_Gender_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_default_values_Gender_group]
for_each = toset(["lny","girl","lan","l"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_default.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_default_Gender.sid
synonym_of = "Lány"
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_default_synonymsOf_Fiu_Gender_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_default_values_Gender_group]
for_each = toset(["fui","fi","boy","f"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_default.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_default_Gender.sid
synonym_of = "Fiú"
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_v1" "chatbot_default_Age" {
unique_name = "Age"
assistant_sid = twilio_autopilot_assistants_v1.chatbot_default.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_default_values_Age_group" {
for_each = toset(["Nem derült ki","89","88","31","61","86","47","5","92","63","24","42","9","50","75","66","58","74","48","85","39","84","87","76","38","21","8","49","17","59","96","34","26","27","28","73","22","77","79","23","64","71","82","46","98","100","68","81","16","19","95","20","44","6","37","4","99","56","90","33","12","93","15","80","70","97","91","13","51","43","67","65","29","11","57","7","54","14","94","52","78","18","41","62","25","60","55","72","35","36","1","32","69","53","3","2","10","40","83","45"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_default.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_default_Age.sid
value = each.key
language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_default_synonymsOf_Nem_derult_ki_Age_group" {
depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_default_values_Age_group]
for_each = toset(["X"])
assistant_sid = twilio_autopilot_assistants_v1.chatbot_default.sid
field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_default_Age.sid
synonym_of = "Nem derült ki"
value = each.key
language = "en-US"
}