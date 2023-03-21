locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  twilio_numbers = ["instagram:17841400289612325", "messenger:325981127456443", "whatsapp:+15077097722"]

  local_config = {
    twilio_numbers                        = local.twilio_numbers
    custom_task_routing_filter_expression = "channelType ==\"web\"  OR isContactlessTask == true OR  twilioNumber IN [${join(", ", formatlist("'%s'", local.twilio_numbers))}]"

    twilio_channels = {
      "facebook" = { "contact_identity" = "messenger:325981127456443", "channel_type" = "facebook" },
      "webchat"  = { "contact_identity" = "", "channel_type" = "web" }
      "whatsapp" = { "contact_identity" = "whatsapp:+15077097722", "channel_type" = "whatsapp" }
    }

    custom_channels = [
      "instagram"
    ]
  }
}