locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {

    custom_task_routing_filter_expression = "channelType =='web' OR isContactlessTask==true OR twilioNumber=='messenger:103647528912458'"

    #Studio flow
    flow_vars = {
      service_sid                            = "ZS19005295d6d012bfea9983de0ba3e6b8"
      environment_sid                        = "ZEa0a7fc38616a1934a04b9e13c678df53"
      capture_channel_with_bot_function_sid  = "ZHbabcecf88565b1288514afe30d0e73f3"
      capture_channel_with_bot_function_name = "channelCapture/captureChannelWithBot"
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
        contact_identity = "messenger:103647528912458"
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/messaging.tftpl"
        channel_flow_vars = {
        }
        chatbot_unique_names = []
      }
    }

  }
}