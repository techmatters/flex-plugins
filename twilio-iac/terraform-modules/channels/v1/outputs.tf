output "channel_studio_flows_sids" {
  description = "Channel studio flow SIDs and related attributes"
  value = {
    for channel, flow in twilio_studio_flows_v2.channel_studio_flow : 
    channel => {
      flow_sid             = flow.sid
      enable_datadog_monitor = lookup(var.channels[channel], "enable_datadog_monitor", false) 
      custom_monitor      = lookup(var.channels[channel], "custom_monitor", {})
    }
  }
}