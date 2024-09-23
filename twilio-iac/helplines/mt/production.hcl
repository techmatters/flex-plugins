locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    custom_task_routing_filter_expression = "channelType =='web'  OR isContactlessTask == true OR  twilioNumber IN ['instagram:17841400289612325', 'messenger:325981127456443', 'whatsapp:+15077097720']"

    workflow_vars = {
      helpline_webchat_location = "https://kellimni.com/"
      ecpm_webchat_location     = "https://empoweringchildren.gov.mt/"
    }
    #Studio flow
    flow_vars = {
      capture_channel_with_bot_function_sid = "ZH95285b8e20b443a167ada3db38b1ff99"
      chatbot_callback_cleanup_function_sid = "ZHe8f285fc47fc1150a87bb46a8eb467be"
      send_message_janitor_function_sid     = "ZH91ec531cde681192daf63e306db90d88"
      widget_from                           = "Kellimni"
      chat_blocked_message                  = "Sorry, you're not able to contact Kellimni from this device or account"
    }


    #Channels
    channels = {
      webchat : {
        channel_type         = "web"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/mt/templates/studio-flows/messaging-lex.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      facebook : {
        channel_type         = "facebook"
        contact_identity     = "messenger:325981127456443"
        templatefile         = "/app/twilio-iac/helplines/mt/templates/studio-flows/messaging-lex.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      whatsapp : {
        messaging_mode       = "conversations"
        channel_type         = "whatsapp"
        contact_identity     = "whatsapp:+15077097720"
        templatefile         = "/app/twilio-iac/helplines/mt/templates/studio-flows/messaging-lex-conv.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      instagram : {
        channel_type         = "custom"
        contact_identity     = "instagram"
        templatefile         = "/app/twilio-iac/helplines/mt/templates/studio-flows/messaging-lex.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      }
    }
  }
}