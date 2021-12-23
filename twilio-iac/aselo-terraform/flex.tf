resource "twilio_flex_flex_flows_v1" "messaging_flow" {
  channel_type  = "sms"
  chat_service_sid = twilio_chat_services_v2.flex_chat_service.sid
  friendly_name = "Flex Messaging Channel Flow"
  integration_type = "studio"
  integration_flow_sid = twilio_studio_flows_v2.messaging_flow.sid
}
resource "twilio_flex_flex_flows_v1" "webchat_flow" {
  channel_type  = "web"
  chat_service_sid = twilio_chat_services_v2.flex_chat_service.sid
  friendly_name = "Flex Web Channel Flow"
  integration_type = "studio"
  integration_flow_sid = twilio_studio_flows_v2.messaging_flow.sid
}
