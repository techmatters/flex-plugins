output "channel_studio_flows_sids" {
  description = "Channel studio flow SIDs and related attributes"
  value = {
    for channel, flow in twilio_studio_flows_v2.channel_studio_flow : 
    channel => {
      flow_sid             = flow.sid
      enable_datadog_monitor = var.channels[channel].enable_datadog_monitor != null ? var.channels[channel].enable_datadog_monitor : null
      custom_monitor      = var.channels[channel].custom_monitor != null ? var.channels[channel].custom_monitor : null
    }
  }
}