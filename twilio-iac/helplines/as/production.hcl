locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    custom_task_routing_filter_expression = "channelType =='web'  OR isContactlessTask == true OR  twilioNumber IN ['messenger:105642325869250', 'instagram:17841459369720372']"
    flow_vars = {
      service_sid                           = "ZSbda78b753fe2ae2de4b3ef3e49f793ea"
      environment_sid                       = "ZE68650cb6e34acccd3294458f29edee0f"
      capture_channel_with_bot_function_sid = "ZHd9eb5ce1b230abe29d9eafccc88b16d3"
      chatbot_callback_cleanup_function_id  = "ZH757387715913592aa1938b284411f18b"
      bot_language                          = "en"
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
        contact_identity     = "messenger:105642325869250"
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      whatsapp : {
        channel_type         = "whatsapp"
        contact_identity     = "whatsapp:+15079441697"
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      instagram : {
        channel_type         = "custom"
        contact_identity     = "instagram"
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      line : {
        channel_type         = "custom"
        contact_identity     = "line"
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      }
    }
  }
}