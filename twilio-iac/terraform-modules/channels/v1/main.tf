terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }
}


resource "twilio_studio_flows_v2" "channel_studio_flow" {
  for_each      = var.channels
  friendly_name = "${title(each.value.friendly_name)} Studio Flow"
  status        = "published"
  definition = templatefile(
    each.value.templatefile,
    {
      flow_vars = each.value.flow_vars,
      channel_attributes = {
        for idx, language in each.value.chatbot_languages : idx => templatefile(
    var.channel_attributes[each.key] ? var.channel_attributes[each.key] : var.channel_attributes["default"], language) } }
  )
}

resource "twilio_flex_flex_flows_v1" "channel_flow" {
  for_each             = var.channels
  channel_type         = each.value.channel_type
  chat_service_sid     = var.flex_chat_service_sid
  friendly_name        = "Flex ${title(var.channel_name)} Flow"
  integration_type     = "studio"
  janitor_enabled      = each.value.channel_type == "custom" ? true : !var.enable_post_survey
  contact_identity     = each.value.channel_contact_identity
  integration_flow_sid = twilio_studio_flows_v2.channel_studio_flow[each.key].sid
  enabled              = true
}
