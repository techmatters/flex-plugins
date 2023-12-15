locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)



  local_config = {

    custom_task_routing_filter_expression = "channelType == 'web'  OR isContactlessTask == true OR  twilioNumber IN ['messenger:113053900394672', 'messenger:154148147974717', 'messenger:338505126727604']"

    #Studio flow
    flow_vars = {
      service_sid                            = "ZS42eddf74e047f1b42570b91766e278c8"
      environment_sid                        = "ZE72542f1675e60fb60a137995fc6b61c2"
      capture_channel_with_bot_function_sid  = "ZH59fec96902ac870dddc110366ea97522"
      capture_channel_with_bot_function_name = "channelCapture/captureChannelWithBot"
      bot_language                           = "en_MW"
    }

    #Channels
    channels = {
      webchat : {
        channel_type     = "web"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/webchat-basic.tftpl"
        channel_flow_vars = {

        }
        chatbot_unique_names = []
      },
      facebook : {
        channel_type     = "facebook"
        contact_identity = "messenger:113053900394672"
        templatefile     = "/app/twilio-iac/helplines/mw/templates/studio-flows/mw-lex.tftpl"
        channel_flow_vars = {
        }
        chatbot_unique_names = []
      },
      ync : {
        channel_type     = "facebook"
        contact_identity = "messenger:154148147974717"
        templatefile     = "/app/twilio-iac/helplines/mw/templates/studio-flows/mw-lex.tftpl"
        channel_flow_vars = {
        }
        chatbot_unique_names = []
      },
      iwf_mw : {
        channel_type     = "facebook"
        contact_identity = "messenger:338505126727604"
        templatefile     = "/app/twilio-iac/helplines/mw/templates/studio-flows/mw-lex.tftpl"
        channel_flow_vars = {
        }
        chatbot_unique_names = []
      }
    }

  }
}