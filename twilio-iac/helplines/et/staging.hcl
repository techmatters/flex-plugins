locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)


  local_config = {

    custom_task_routing_filter_expression = "channelType =='web'  OR isContactlessTask == true OR  twilioNumber=='messenger:110628727963549'"

    #Studio flow
    flow_vars = {
      service_sid                           = "ZS3d6dc8ab3c15e8332ecab26e71550a04"
      environment_sid                       = "ZE784b608eee68011f587fae611b0266da"
      capture_channel_with_bot_function_sid = "ZH5b374a5b1381d18776ff3059cb5b92e8"
      operating_hours_function_sid          = "ZHc104869815fa574a1b5ce70f733bc680"
      bot_language                          = "en"
    }

    #Channels
    channels = {
      webchat : {
        channel_type     = "web"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/et/templates/studio-flows/messaging-chatbot-operating-hours.tftpl"
        channel_flow_vars = {
          chat_blocked_message = "Sorry, you're not able to contact Adama Child Helpline from this device or account"
        }
        chatbot_unique_names = []
      },
      facebook : {
        channel_type     = "facebook"
        contact_identity = "messenger:110628727963549"
        templatefile     = "/app/twilio-iac/helplines/et/templates/studio-flows/messaging-chatbot-operating-hours.tftpl"
        channel_flow_vars = {
          chat_blocked_message = "Sorry, you're not able to contact Adama Child Helpline from this device or account"
        }
        chatbot_unique_names = []
      }
    }



  }
}