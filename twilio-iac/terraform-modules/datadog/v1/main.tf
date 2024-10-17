terraform {
  required_providers {
    datadog = {
      source = "datadog/datadog"
      version = "3.46.0"
    }
  }
}


resource "datadog_logs_metric" "channel_logs_metric" {
  for_each      = var.channel_studio_flow_sids
  name = "studio_flows.started.by.channel.${each.key}.${var.short_helpline}.${var.short_environment}"
  compute {
    aggregation_type = "count"
  }
  filter {
    query = "service:twilio-event-stream @type:com.twilio.studio.flow.execution.started @data.flow_sid:${each.value}"
  }
  group_by {
    path     = "@data.flow_sid"
    tag_name = "${var.short_helpline}_${var.short_environment}_${each.key}"
  }
}