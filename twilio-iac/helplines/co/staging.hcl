/**
 * This file overrides the config output by `common.hcl` that are specific to the staging environment.
 **/

locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  twilio_numbers     = ["messenger:103574689075106", "twitter:1540032139563073538", "instagram:17841454586132629", "whatsapp:+12135834846"]

  local_config = {
    twilio_numbers = local.twilio_numbers

    custom_task_routing_filter_expression = "channelType ==\"web\"  OR isContactlessTask == true OR  twilioNumber IN [${join(", ", formatlist("'%s'", local.twilio_numbers))}] OR to IN [\"+17752526377\",\"+578005190671\"]"

    operating_hours_function_sid = "ZH5fcc5dee5089c176acd0bd24e7fa873e"

    enable_voice_channel = true

    twilio_channels = {
      "facebook" = { "contact_identity" = "messenger:103574689075106", "channel_type" = "facebook" },
      "webchat"  = { "contact_identity" = "", "channel_type" = "web" },
      "whatsapp" = { "contact_identity" = "whatsapp:+12135834846", "channel_type" = "whatsapp" }
    }
  }
}