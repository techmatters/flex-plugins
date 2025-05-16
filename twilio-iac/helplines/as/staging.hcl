locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    enable_post_survey                    = true
    enable_datadog_monitoring             = false
    enable_lex_v2                         = true
    custom_task_routing_filter_expression = "channelType IN ['instagram','messenger','web','whatsapp','telegram','line','voice'] OR isContactlessTask == true OR  twilioNumber == 'messenger:131329426738030' "
    permission_config                     = "demo"

    #Studio flow
    flow_vars = {
      capture_channel_with_bot_function_sid = "ZH979fc67a70a4a9572552c81a0d5d41d7"
      chatbot_callback_cleanup_function_sid = "ZH31416a207f81bf504a1391ed7649400e"
      send_message_janitor_function_sid     = "ZH91e33557d45b6dd60100876452e2428b"
      bot_language                          = "en-US"
      widget_from                           = "Aselo"
      chat_blocked_message                  = "Sorry, you're not able to contact Aselo from this device or account"
      error_message                         = "There has been an error with your message, please try writing us again."

    }

    channels = {
      webchat : {
        channel_type         = "web"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-blocking.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      facebook : {
        messaging_mode       = "conversations"
        channel_type         = "messenger"
        contact_identity     = "messenger:131329426738030"
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-lex-v3-blocking-lambda.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      whatsapp : {
        messaging_mode       = "conversations"
        channel_type         = "whatsapp"
        contact_identity     = "whatsapp:+12055189944"
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-lex-v3-blocking-lambda.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      line : {
        messaging_mode       = "conversations"
        channel_type         = "custom"
        contact_identity     = "line"
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-custom-channel-lex-v3-blocking-lambda.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      telegram : {
        messaging_mode       = "conversations"
        channel_type         = "custom"
        contact_identity     = "telegram"
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-custom-channel-lex-v3-blocking-lambda.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      instagram : {
        messaging_mode       = "conversations"
        channel_type         = "custom"
        contact_identity     = "instagram"
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-custom-channel-lex-v3-blocking-lambda.tftpl"
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

    get_profile_flags_for_identifier_base_url = "https://hrm-staging.tl.techmatters.org/lambda/twilio/account-scoped"
  }
}