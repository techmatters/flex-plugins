output "language_bot_sid" {
  description = "Twilio SID of the 'LanguageBot' chatbot"
  value       = twilio_autopilot_assistants_v1.language_bot.sid
}

output "permission_bot_en_sid" {
  description = "Twilio SID of the 'permissionBot_en' chatbot"
  value       = twilio_autopilot_assistants_v1.permission_bot_en.sid
}

output "permission_bot_fil_sid" {
  description = "Twilio SID of the 'permissionBot_fil' chatbot"
  value       = twilio_autopilot_assistants_v1.permission_bot_fil.sid
}

output "pre_survey_bot_fil_sid" {
  description = "Twilio SID of the 'preSurvey_fil' chatbot"
  value       = twilio_autopilot_assistants_v1.pre_survey_bot_fil.sid
}
