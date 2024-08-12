locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    enable_post_survey                    = true
    custom_task_routing_filter_expression = "channelType IN ['instagram','messenger','web','whatsapp','telegram','line','voice']  OR isContactlessTask == true OR  twilioNumber == 'messenger:105642325869250', 'instagram:17841459369720372' "
    flow_vars = {
      capture_channel_with_bot_function_sid = "ZHd9eb5ce1b230abe29d9eafccc88b16d3"
      chatbot_callback_cleanup_function_sid = "ZH757387715913592aa1938b284411f18b"
      bot_language                          = "en-US"
    }

    channels = {
      webchat : {
        channel_type         = "web"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-lex-v2.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      facebook : {
        messaging_mode       = "conversations"
        channel_type         = "facebook"
        contact_identity     = "messenger:105642325869250"
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-lex-v3.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      whatsapp : {
        messaging_mode       = "conversations"
        channel_type         = "whatsapp"
        contact_identity     = "whatsapp:+15079441697"
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-lex-v3.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      instagram : {
        messaging_mode       = "conversations"
        channel_type         = "custom"
        contact_identity     = "instagram"
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-lex-v3.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      line : {
        messaging_mode       = "conversations"
        channel_type         = "custom"
        contact_identity     = "line"
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-lex-v3.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      voice : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/voice-basic.tftpl"
        channel_flow_vars = {
          voice_ivr_greeting_message = "Hello, you are contacting Aselo. Please hold for a counsellor."
          voice_ivr_blocked_message  = "I'm sorry your number has been blocked."
          voice_ivr_language         = "en-US"
        }
        chatbot_unique_names = []
      }
    }
  }
}