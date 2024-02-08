output "voice_call_studio_flow_sid" {
  description = "Twilio SID of the 'Voice Call Flow' studio flow."
  value = twilio_studio_flows_v2.voice_call_flow.sid
}
