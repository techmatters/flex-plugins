output "studio_flows_sids" {
  value = { for idx, w in var.studio_flows : idx => try(twilio_studio_flows_v2.studio_flow[idx].sid, "") }
}