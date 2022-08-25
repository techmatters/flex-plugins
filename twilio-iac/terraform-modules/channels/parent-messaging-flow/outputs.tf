output "parent_messaging_studio_flow_sid" {
  description = "Twilio SID of the 'Parent Messaging Flow' studio flow."
  value = twilio_studio_flows_v2.parent_messaging_flow.sid
}
