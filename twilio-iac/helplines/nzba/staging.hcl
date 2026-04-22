locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    enable_external_recordings            = true
    enable_post_survey                    = true
    enable_datadog_monitoring             = false
    custom_task_routing_filter_expression = "channelType IN ['web','voice']  OR isContactlessTask == true"
    permission_config                     = "nzba"

    #Studio flow
    flow_vars = {
      bot_language                          = "en_NZBA"
      widget_from                           = "Barnardos"
      chat_blocked_message                  = "Sorry, you're not able to contact Barnardos from this device or account"
      error_message                         = "There has been an error with your message, please try writing us again."
      send_message_janitor_function_sid     = "ZH17d7db67fa6ab6c2a8d8df2bef8fc55e"
    }

    channels = {
      webchat : {
        channel_type         = "web"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-blocking-preq-lambda-sd.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      voice : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/voice-basic.tftpl"
        channel_flow_vars = {
          voice_ivr_greeting_message = "Hello, you are contacting Barnardos. Please hold for a counsellor."
          voice_ivr_blocked_message  = "I'm sorry your number has been blocked."
          voice_ivr_language         = "en-US"
        }
        chatbot_unique_names = []
      },
    }

    system_down_templatefile = "/app/twilio-iac/helplines/templates/studio-flows/system-down.tftpl"
    enable_system_down       = true
    system_down_flow_vars = {
      is_system_down                   = "false"
      message                          = "We're sorry — we're experiencing technical difficulties and may not be able to respond right now. Your message is important and we hope to reconnect soon. If you'd like support in the meantime, you can call or text 988, or call 911 if you are in immediate danger. Thank you for your patience."
      voice_message                    = "Hello. You have reached the North Carolina Warm Line. Unfortunately, we are experiencing technical difficulties and cannot take your call right now. We're sorry for the inconvenience. If you would like immediate support, you can call or text 988 to reach the Suicide & Crisis Lifeline, or call 911 if you are in immediate danger. Please try again later. Thank you for your understanding."
      send_studio_message_function_sid = "ZHbbf0fb1ec68a5aacc31e8c50415b97bb"
      call_action                      = "message"
      forward_number                   = "+123"
      recording_url                    = "https://<place_holder>.mp3"
    }

    get_profile_flags_for_identifier_base_url = "https://hrm-staging-eu.tl.techmatters.org/lambda/twilio/account-scoped"

  }
}