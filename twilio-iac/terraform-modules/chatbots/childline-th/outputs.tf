output "pre_survey_bot_sid" {
  description = "Twilio SID of the 'pre survey' chatbot"
  value = twilio_autopilot_assistants_v1.pre_survey.sid
}

output "post_survey_bot_sid" {
  description = "Twilio SID of the 'post survey' chatbot"
  value = twilio_autopilot_assistants_v1.post_survey.sid
}

