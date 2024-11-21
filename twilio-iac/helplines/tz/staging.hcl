locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    enable_post_survey                    = true
    enable_datadog_monitoring                = false
    custom_task_routing_filter_expression = "channelType IN ['web'] OR isContactlessTask == true "

    #Studio flow
    flow_vars = {

    }

    channels = {
      webchat : {
        channel_type         = "web"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/webchat-basic.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      }
    }

  }
}