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
        contact_identity     = "messenger:106338277501244"
        templatefile         = "/app/twilio-iac/helplines/zm/templates/studio-flows/messaging.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      whatsapp : {
        messaging_mode       = "conversations"
        channel_type         = "whatsapp"
        contact_identity     = "whatsapp:+17035961454"
        templatefile         = "/app/twilio-iac/helplines/zm/templates/studio-flows/messaging-conv.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      }
    }
    #Studio flow
    flow_vars = {
      service_sid                   = "ZSe4567a77a4d25e4d539aa715c46f0202"
      environment_sid               = "ZEb5f4d53708997b098f3c7456435c2083"
      send_message_janitor_function_sid = "ZH0b9f111cb63b53f265d487aa63bb4818"
      capture_channel_with_bot_function_sid = "ZHca6a97b33320c5efd5430fb9f1a5480b"
      widget_from                           = "Lifeline/Childline Zambia"
      chat_blocked_message                  = "Hi, you've been blocked from accessing Childline/Lifeline services and we are not able to read or receive further messages from you."
    }

    ui_editable = true
    #Chatbots
  }
}