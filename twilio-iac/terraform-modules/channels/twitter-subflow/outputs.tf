output "twitter_messaging_studio_subflow_sid" {
  description = "Twilio SID of the 'Twitter Messaging SubFlow' studio flow."
  value = twilio_studio_flows_v2.twitter_messaging_subflow.sid
}
