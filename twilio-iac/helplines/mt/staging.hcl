locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  twilio_numbers = ["messenger:111279668497853"]

  local_config = {
    twilio_numbers = local.twilio_numbers
    twilio_channels = {
      "webchat" = {"contact_identity" = "", "channel_type" ="web"  },
      "facebook" = {"contact_identity" = "messenger:111279668497853", "channel_type" ="facebook"  }
    }
    custom_task_routing_filter_expression = "channelType ==\"web\"  OR isContactlessTask == true OR  twilioNumber IN [${join(", ", formatlist("'%s'", local.twilio_numbers))}]"
  }
}