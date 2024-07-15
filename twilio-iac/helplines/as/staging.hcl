locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    enable_post_survey                    = true
    custom_task_routing_filter_expression = "channelType IN ['web','whatsapp','telegram','line','voice'] OR isContactlessTask == true OR  twilioNumber == 'messenger:131329426738030' "

    #Studio flow
    flow_vars = {
      capture_channel_with_bot_function_sid = "ZH979fc67a70a4a9572552c81a0d5d41d7"
      chatbot_callback_cleanup_function_sid = "ZH31416a207f81bf504a1391ed7649400e"
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
        channel_type         = "facebook"
        contact_identity     = "messenger:131329426738030"
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-lex-v2.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      whatsapp : {
        messaging_mode       = "conversations"
        channel_type         = "whatsapp"
        contact_identity     = "whatsapp:+12055189944"
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
      telegram : {
        messaging_mode       = "conversations"
        channel_type         = "custom"
        contact_identity     = "telegram"
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

    # HRM
    case_status_transition_rules = [
      {
        startingStatus : "inProgress",
        targetStatus : "closed",
        timeInStatusInterval : "5 minutes",
        description : "system - 'In Progress' cases are closed after 5 minutes"
      }
    ]
  }
}