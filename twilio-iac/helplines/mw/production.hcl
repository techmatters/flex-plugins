locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)



  local_config = {

    custom_task_routing_filter_expression = "channelType == 'web'  OR isContactlessTask == true OR  twilioNumber IN ['messenger:113053900394672', 'messenger:154148147974717', 'messenger:338505126727604']"

    workflows = {
      master : {
        friendly_name : "Master Workflow"
        templatefile : "/app/twilio-iac/helplines/mw/templates/workflows/master-prod.tftpl"
      }
    }

    task_queues = {
      iwf : {
        "target_workers" = "1==1",
        "friendly_name"  = "IWF"
      }
    }

    #Studio flow
    flow_vars = {
      service_sid                            = "xx"
      environment_sid                        = "xx"
      capture_channel_with_bot_function_sid  = "xx"
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
        contact_identity = "messenger:113053900394672"
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/messaging.tftpl"
        channel_flow_vars = {
        }
        chatbot_unique_names = []
      }
    }

  }
}