output "whatsapp_messaging_studio_flow_sid" {
  description = "Twilio SID of the 'WhatsApp Messaging Flow' studio flow."
  value = twilio_studio_flows_v2.whatsapp_messaging_flow.sid
}


output "whatsapp_flow_sid" {
  description = "Twilio SID of the 'WhatsApp Flex Flow' studio flow."
  value = twilio_flex_flex_flows_v1.whatsapp_flow.sid
}
