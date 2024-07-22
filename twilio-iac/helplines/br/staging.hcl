locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)


  local_config = {
    custom_task_routing_filter_expression = "twilioNumber=='messenger:104153648721033' OR isContactlessTask==true OR channelType=='web' OR twilioNumber=='line:Uedd8bf552b012ffe47233c545465c43e' OR twilioNumber=='instagram:17841454785688794'"

    #Studio flow
    flow_vars = {
      service_sid                           = "ZS948c6d0e9a4af91d194721de5b570840"
      environment_sid                       = "ZEffec81f6d977d2777653941e5a8bb225"
      capture_channel_with_bot_function_sid = "ZHb3374890cf7d52bcbe8ca9b78484e666"
      operating_hours_function_sid          = "ZH337c4825cb337233c10015b70b58f87c"
      send_message_run_janitor_function_sid = "ZH9a486def217661efc2fb446193676feb"
      widget_from                            = "SaferNet"
      chat_blocked_message                   = "Sorry, you're not able to contact SaferNet from this device or account"
    }

    #Channels
    channels = {
      facebook : {
        channel_type     = "facebook"
        contact_identity = "messenger:104153648721033"
        templatefile     = "/app/twilio-iac/helplines/br/templates/studio-flows/messaging.tftpl"
        channel_flow_vars = {}
        chatbot_unique_names = []
      }
    }

  }
}