locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    custom_task_routing_filter_expression = "channelType IN ['web','voice','sms']  OR isContactlessTask == true"
    permission_config                     = "usnc"

    #Studio flow
    flow_vars = {
      widget_from          = "Promise Resource Network"
      chat_blocked_message = "Sorry, you're not able to contact Promise Resource Network from this device or account"
      error_message        = "There has been an error with your message, please try writing us again.",
      play_message_voice_blocked = "Thank you for calling the Promise Resource Network Warm Line. We provide compassionate, peer-based support to individuals across North Carolina. Important notice: Beginning May 1, our Warm Line can be reached by dialing 1-855-733-7762. The number 1-833-390-7728 will no longer be available after that date. Please remain on the line while you wait. If you hang up, you may lose your place in line. A peer listener will be with you as soon as possible to offer understanding and support based on lived experience."
      play_message_voice_blocked = "Due to repeated use of the service in ways that did not align with Warm Line participation guidelines, access to the Promise Resource Network NC Warm Line has been restricted for this number/account."
    }

    channels = {
      webchat : {
        channel_type         = "web"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-blocking-lambda.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      voice : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/voice-blocking-no-op-hours-sd.tftpl"
        channel_flow_vars = {
          play_message_voice_blocked = "Thank you for calling the Promise Resource Network Warm Line. We provide compassionate, peer-based support to individuals across North Carolina. Important notice: Beginning May 1, our Warm Line can be reached by dialing 1-855-733-7762. The number 1-833-390-7728 will no longer be available after that date. Please remain on the line while you wait. If you hang up, you may lose your place in line. A peer listener will be with you as soon as possible to offer understanding and support based on lived experience."
          play_message_voice_blocked = "Due to repeated use of the service in ways that did not align with Warm Line participation guidelines, access to the Promise Resource Network NC Warm Line has been restricted for this number/account."
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
      send_studio_message_function_sid = "ZHda5f23152bb1a843c303049674007b87"
      call_action                      = "message"
      forward_number                   = "+123"
      recording_url                    = "https://<place_holder>.mp3"
    }

    get_profile_flags_for_identifier_base_url = "https://hrm-staging.tl.techmatters.org/lambda/twilio/account-scoped"

  }
}