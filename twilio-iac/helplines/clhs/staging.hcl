/**
 * This file overrides the config output by `common.hcl` that are specific to the staging environment.
 **/

locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    custom_task_routing_filter_expression = ""
    flow_vars                             = {}
  }
    #Channels
    channels = {
      webchat : {
        channel_type         = "web"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-blocking-lambda-sd.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      }
    }

  #System Down Configuration
    system_down_templatefile = "/app/twilio-iac/helplines/templates/studio-flows/system-down.tftpl"
    enable_system_down       = true
    system_down_flow_vars = {
      is_system_down                   = "false"
      message                          = "Our chat system is currently experiencing technical difficulties. We apologize for the inconvenience and are working to get it back online as soon as possible. If this is an emergency, please call +260955065373. Please note that this is not a toll-free line so you may incur costs."
      voice_message                    = "Our chat system is currently experiencing technical difficulties. We apologize for the inconvenience and are working to get it back online as soon as possible. If this is an emergency, please call +260955065373. Please note that this is not a toll-free line so you may incur costs."
      send_studio_message_function_sid = "ZH4958d28a21898fa32e4b656635475f33"
      call_action                      = "message"
      forward_number                   = "+123"
      recording_url                    = "https://<place_holder>.mp3"
    }
}