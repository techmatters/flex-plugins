locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)


  local_config = {

    custom_task_routing_filter_expression = "channelType =='web'  OR isContactlessTask == true OR  twilioNumber IN ['messenger:111279668497853']"
 
    workflow_vars = {
     helpline_webchat_location = "https://tl-public-chat-mt-stg.s3.eu-west-1.amazonaws.com/mt-chat-staging.html"
     ecpm_webchat_location = "https://empoweringchildren.gov.mt/"
    }
    
    flow_vars = {
      service_sid                           = "ZS2cf2a4933a3f9782a2907146287f3f1a"
      environment_sid                       = "ZE512e22f5abb4cc30757b4db4181ab40b"
      capture_channel_with_bot_function_sid = "ZH75af18446e362dd58e4fd76cc4e1dca1"
      chatbot_callback_cleanup_function_sid  = "ZH85433c3fc77c22dc1c6cf385853598d8"
      send_message_janitor_function_sid     = "ZH19f41d74c3c64c23b5d624ab84d1ddde"
      widget_from                            = "Kellimni"
      chat_blocked_message                   = "Sorry, you're not able to contact Kellimni from this device or account"
    }

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
        contact_identity     = "messenger:111279668497853"
        templatefile         = "/app/twilio-iac/helplines/mt/templates/studio-flows/messaging-lex.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      }
    }

  }
}
