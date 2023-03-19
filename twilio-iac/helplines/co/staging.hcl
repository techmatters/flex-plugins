locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  twilio_numbers = ["messenger:103574689075106","twitter:1540032139563073538","instagram:17841454586132629","whatsapp:+12135834846"]

  local_config = {
    twilio_numbers = local.twilio_numbers

    custom_task_routing_filter_expression = "channelType ==\"web\"  OR isContactlessTask == true OR  twilioNumber IN [${join(", ", formatlist("'%s'", local.twilio_numbers))}] OR to IN [\"+17752526377\",\"+578005190671\"]"
  }
}