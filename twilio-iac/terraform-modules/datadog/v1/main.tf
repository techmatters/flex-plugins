terraform {
  required_providers {
    datadog = {
      source = "datadog/datadog"
      version = "3.46.0"
    }
  }
}


resource "datadog_logs_metric" "channel_logs_metric" {
  for_each = var.enable_datadog_monitoring ? {
    for channel, config in var.channel_studio_flow_sids :
    channel => config
    if config.enable_datadog_monitor == true
  } : {}
  name = "studio_flows.started.by.channel.${each.key}.${var.short_helpline}.${var.short_environment}"
  compute {
    aggregation_type = "count"
  }
  filter {
    query = "service:twilio-event-stream @type:com.twilio.studio.flow.execution.started @data.flow_sid:${each.value.flow_sid}"
  }
  group_by {
    path     = "@data.flow_sid"
    tag_name = "${lower(var.short_helpline)}_${lower(var.short_environment)}_${each.key}"
  }
}

resource "datadog_monitor" "nr_of_executions_threshold" {
  for_each = var.enable_datadog_monitoring ? {
    for channel, config in var.channel_studio_flow_sids :
    channel => config
    if config.enable_datadog_monitor == true
  } : {}
  include_tags = false
  dynamic "scheduling_options" {
    for_each = each.value.custom_monitor.custom_schedule != null ? [1] : []

    content {
      custom_schedule {
        recurrence {
          rrule    = each.value.custom_monitor.custom_schedule.rrule
          timezone = each.value.custom_monitor.custom_schedule.timezone
        }
      }
    }
  }
  name = "Nr of executions on ${var.short_helpline}_${var.short_environment}_${each.key}"
  type = "query alert"
  query = replace(
    lookup(each.value.custom_monitor, "query", "sum(last_1d):sum:$metric${each.key}.${var.short_helpline}.${var.short_environment}{*}.as_count() == 0"),
    "$metric$",
    datadog_logs_metric.channel_logs_metric[each.key].name
  )
  message = "Notify: @slack-aselo-customer-support @alejandro@techmatters.org"
}