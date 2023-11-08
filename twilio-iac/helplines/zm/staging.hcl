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
        channel_type         = "whatsapp"
        contact_identity     = "whatsapp:+447450769014"
        templatefile         = "/app/twilio-iac/helplines/zm/templates/studio-flows/messaging.tftpl"
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

    }

    ui_editable = true
    #Chatbots
  }
}