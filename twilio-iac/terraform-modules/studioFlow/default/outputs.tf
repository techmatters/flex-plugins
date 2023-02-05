output "messaging_studio_flow_sid" {
  description = "Twilio SID of the 'Messaging Flow' studio flow."
  value = twilio_studio_flows_v2.messaging_flow.sid
}
