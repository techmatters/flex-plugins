locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  twilio_numbers = ["instagram:17841400289612325", "messenger:325981127456443", "whatsapp:+15077097722"]

  local_config = {

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
        templatefile     = "/app/twilio-iac/helplines/mt/templates/studio-flows/web.tftpl"
        channel_flow_vars = {

        }
        chatbot_unique_names = []
      },
      facebook : {
        channel_type     = "facebook"
        contact_identity = "messenger:325981127456443"
        templatefile     = "/app/twilio-iac/helplines/mt/templates/studio-flows/messaging.tftpl"
        channel_flow_vars = {
        }
        chatbot_unique_names = []
      },
      whatsapp : {
        channel_type     = "whatsapp"
        contact_identity = "whatsapp:+15077097722"
        templatefile     = "/app/twilio-iac/helplines/mt/templates/studio-flows/messaging.tftpl"
        channel_flow_vars = {
        }
        chatbot_unique_names = []
      },
      instagram : {
        channel_type     = "custom"
        contact_identity = "instagram"
        templatefile     = "/app/twilio-iac/helplines/mt/templates/studio-flows/messaging.tftpl"
        channel_flow_vars = {
        }
        chatbot_unique_names = []
      }
    }

    twilio_numbers                        = local.twilio_numbers
    custom_task_routing_filter_expression = "channelType ==\"web\"  OR isContactlessTask == true OR  twilioNumber IN [${join(", ", formatlist("'%s'", local.twilio_numbers))}]"


  }
}