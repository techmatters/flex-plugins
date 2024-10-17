output "channel_studio_flows_sids" {
  description = "Channel studio flow sids"
  value = {
    for channel, flow in twilio_studio_flows_v2.channel_studio_flow :
    channel => flow.sid
  }
}