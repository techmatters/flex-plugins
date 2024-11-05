locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    enable_datadog_monitoring             = true
    custom_task_routing_filter_expression = "helpline=='SaferNet' or isContactlessTask==true OR channelType IN ['web', 'messenger'] OR twilioNumber=='messenger:175804982467404'"

    #Studio flow
    flow_vars = {
      service_sid                           = "ZSebf401319dc0c98090afd70f4d6b825f"
      environment_sid                       = "ZE206b298e102d8432ab9bfe4732064908"
      capture_channel_with_bot_function_sid = "ZH38f084d1b19886c2f1dfdc9829ce5d42"
      operating_hours_function_sid          = "ZH2890f1db05c6162f65100d2f08e25b76"
      send_message_run_janitor_function_sid = "ZHd26fbb04d70461a1846391ce40755cf4"
      widget_from                            = "SaferNet"
      chat_blocked_message                   = "Sorry, you're not able to contact SaferNet from this device or account"
    }

    #Channels
    channels = {
      facebook : {
        messaging_mode       = "conversations"
        channel_type         = "messenger"
        contact_identity     = "messenger:175804982467404"
        templatefile         = "/app/twilio-iac/helplines/br/templates/studio-flows/messaging-conv.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
        enable_datadog_monitor = true
        custom_monitor = {
          query = "sum(last_1w):sum:<metric>{*}.as_count() == 0"
          custom_schedule = {
            rrule    = "FREQ=WEEKLY;INTERVAL=1;BYHOUR=10;BYMINUTE=0;BYDAY=MO"
            timezone = "America/Santiago"
          }
        }
      }
    }
  }
}