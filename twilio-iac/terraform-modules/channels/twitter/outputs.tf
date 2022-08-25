output "twitter_messaging_studio_flow_sid" {
  description = "Twilio SID of the 'Twitter Messaging Flow' studio flow."
  value = twilio_studio_flows_v2.twitter_messaging_flow.sid
}


output "twitter_flow_sid" {
  description = "Twilio SID of the 'Twitter Flex Flow' studio flow."
  value = twilio_flex_flex_flows_v1.twitter_flow.sid
}
