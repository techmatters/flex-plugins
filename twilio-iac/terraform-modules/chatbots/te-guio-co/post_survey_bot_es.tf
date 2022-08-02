resource "twilio_autopilot_assistants_v1" "post_survey_bot_es" {
  unique_name   = "post_survey_bot"
  friendly_name = "A bot that collects a post-survey"
  style_sheet = jsonencode({
    "style_sheet" : {
      "voice" : {
        "say_voice" : "Polly.Salli"
      }
    }
  })
  defaults = jsonencode({
    "defaults" : {
      "assistant_initiation" : "",
      "fallback" : ""
    }
  })
  log_queries = true
}