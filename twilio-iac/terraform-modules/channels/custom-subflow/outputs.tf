output "custom_messaging_studio_subflow_sid" {
  description = "Twilio SID of the 'Custom Messaging SubFlow' studio flow."
  value = twilio_studio_flows_v2.custom_messaging_subflow.sid
}
