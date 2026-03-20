locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    custom_task_routing_filter_expression = "channelType IN ['web','voice','sms']  OR isContactlessTask == true"
    permission_config                     = "usnc"

    #Studio flow
    flow_vars = {
      widget_from                       = "Promise Resource Network"
      chat_blocked_message              = "Sorry, you're not able to contact Promise Resource Network from this device or account"
      error_message                     = "There has been an error with your message, please try writing us again."
      send_message_janitor_function_sid = "ZH12353d1c76792d7d5b2e721006af349d"
      bot_language                      = "en-USNC"
    }

    channels = {
      webchat : {
        channel_type     = "web"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/usnc/templates/studio-flows/messaging-blocking-preq-lambda-sd.tftpl"
        channel_flow_vars = {
          widget_from                   = "Warm Line"
          chat_blocked_message          = "Due to repeated use of the service in ways that did not align with Warm Line participation guidelines, access to the Promise Resource Network NC Warm Line has been restricted for this number/account."
          send_message_webchat_prequeue = "Welcome to the Promise Resource Network Warm Line. We offer compassionate peer support to residents of North Carolina.\nPlease stay in the chat while you wait so you don’t lose your place in line. A Peer Supporter will join you as soon as they are available."
        }
        chatbot_unique_names = []
      },
      voice : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/usnc/templates/studio-flows/voice-blocking-no-op-hours-rec-sd.tftpl"
        channel_flow_vars = {
          play_message_voice_prequeue = "https://usnc-assets-3228.twil.io/play_message_voice_prequeue.mp3"
          play_message_voice_blocked  = "Due to repeated use of the service in ways that did not align with Warm Line participation guidelines, access to the Promise Resource Network NC Warm Line has been restricted for this number/account."
          voice_ivr_language          = "en-US"
        }
        chatbot_unique_names = []
      },
      sms : {
        messaging_mode   = "conversations"
        channel_type     = "sms"
        contact_identity = "+16082004843"
        templatefile     = "/app/twilio-iac/helplines/usnc/templates/studio-flows/messaging-lex-v3-blocking-lambda-sd.tftpl"
        channel_flow_vars = {
          widget_from           = "Warm Line"
          send_message_prequeue = "Hello"
        }
        chatbot_unique_names = []
      }
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

  }
}