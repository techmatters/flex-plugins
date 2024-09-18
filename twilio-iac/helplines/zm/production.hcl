locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {

    channels = {
      webchat : {
        channel_type         = "web"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/zm/templates/studio-flows/messaging-webchat.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      facebook : {
        channel_type         = "facebook"
        contact_identity     = "messenger:261976427221327"
        templatefile         = "/app/twilio-iac/helplines/zm/templates/studio-flows/messaging.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      whatsapp : {
        messaging_mode       = "conversations"
        channel_type         = "whatsapp"
        contact_identity     = "whatsapp:+260973553422"
        templatefile         = "/app/twilio-iac/helplines/zm/templates/studio-flows/messaging-conv.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      voice : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/zm/templates/studio-flows/voice-ac.tftpl"
        channel_flow_vars = {
        }
        chatbot_unique_names = []
      }
    }
    #Studio flow
    flow_vars = {
      service_sid                           = "ZS6ac8653b2845b206a0a0bbdda861e3e9"
      environment_sid                       = "ZEe7486f2ebe86b00591d4550ab0389566"
      send_message_janitor_function_sid     = "ZH55f6e780a85d1371f00234481fee3b35"
      capture_channel_with_bot_function_sid = "ZH38598267c5c40e659e4fef46a019dd24"
      widget_from                           = "Lifeline/Childline Zambia"
      chat_blocked_message                  = "Hi, you've been blocked from accessing Childline/Lifeline services and we are not able to read or receive further messages from you."
      voice_ivr_language                    = "en-US",
      voice_ivr_blocked_message            = "Hi, you've been blocked from accessing Childline/Lifeline services and we are not able to receive further calls from you."
    }
  }
}