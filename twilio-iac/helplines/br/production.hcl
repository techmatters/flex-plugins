locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {

    custom_task_routing_filter_expression = "helpline=='SaferNet' or isContactlessTask==true OR channelType=='web' OR twilioNumber=='messenger:175804982467404' OR channelType=='facebook'"

    #Studio flow
    flow_vars = {
      service_sid                           = "ZSebf401319dc0c98090afd70f4d6b825f"
      environment_sid                       = "ZE206b298e102d8432ab9bfe4732064908"
      capture_channel_with_bot_function_sid = "ZH38f084d1b19886c2f1dfdc9829ce5d42"
      operating_hours_function_sid          = "ZH2890f1db05c6162f65100d2f08e25b76"
      send_message_run_janitor_function_sid = "ZHd26fbb04d70461a1846391ce40755cf4"
    }

    #Channels
    channels = {
      facebook : {
        channel_type         = "facebook"
        contact_identity     = "messenger:175804982467404"
        templatefile         = "/app/twilio-iac/helplines/br/templates/studio-flows/messaging.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      }
    }
  }
}