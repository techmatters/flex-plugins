output "pre_survey_bot_es_sid" {
  description = "Twilio SID of the 'preSurvey_es' chatbot"
  value       = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
}
output "post_survey_bot_es_sid" {
  description = "Twilio SID of the 'postSurvey_es' chatbot"
  value       = twilio_autopilot_assistants_v1.post_survey_bot_es.sid
}
