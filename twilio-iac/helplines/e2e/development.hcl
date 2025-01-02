
locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    enable_external_recordings            = true
    permission_config = "e2e"
    custom_task_routing_filter_expression = "helpline IN ['Childline', ''] OR channelType =='web' OR isContactlessTask == true"
    flow_vars = {
      service_sid                           = "ZS43ea9fdb2e1901c2fc23b4654b285202"
      environment_sid                       = "ZE0241494e654e208f715b4d9612171dc0"
      capture_channel_with_bot_function_sid = "ZH774135cb0184df6c39c6378f1598cd09"
      chatbot_callback_cleanup_function_sid  = "ZH25485bb64766247dc9102fb9a6532eb8"
      bot_language                          = "en"
    }
    channels = {
      webchat : {
        channel_type         = "web"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-lex-v2.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      }
    }
  }
}