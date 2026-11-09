terraform {
  required_providers {
    datadog = {
      source = "datadog/datadog"
      version = "3.46.0"
    }
    aws = {
      source = "hashicorp/aws"
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
  on_missing_data = "default"
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
  query = each.value.custom_monitor.query != null ? replace(each.value.custom_monitor.query,"<metric>",datadog_logs_metric.channel_logs_metric[each.key].name) :  "sum(last_1h):sum:${datadog_logs_metric.channel_logs_metric[each.key].name}{*}.as_count() == 0"
  message = "Notify: @slack-aselo-customer-support @alejandro@techmatters.org"
  tags = ["env:${lower(var.short_environment)}","type:studio-flow-executions","source:terraform"]
}

# Helpline tags for Datadog logs: this helpline's rows in the two Datadog Reference Tables that map
# Twilio SIDs to helplines, written on every configure apply. Replaces the hand-maintained lists in the
# Datadog pipelines "Adding Account Tags", "Adding Account Tags (accountSid)" and
# "Studio Flows Sids to Labels", which miss new accounts and flows (MISSING_TAG / flow_name_missing).
#
# How it fits together (bucket, Reference Tables and the global pipeline are set up outside this repo):
#   s3://<bucket>/helpline-tags/<folder>/<code>_<env>.csv  this helpline's rows (other applies read them)
#   s3://<bucket>/<merged file>                            every helpline's rows merged; the Datadog
#                                                          Reference Table syncs from it (~every 5 minutes)
#   folder / merged file / Reference Table per table:
#     accounts      accounts/      aselo_twilio_accounts.csv      aselo_twilio_accounts
#     studio_flows  studio-flows/  aselo_twilio_studio_flows.csv  aselo_twilio_studio_flows
# Each apply rebuilds the merged files from all the per-helpline files (and the seed files) plus its own
# current rows, so one apply is enough and no list is edited by hand. Rows are keyed by SID; for the same
# SID a later file wins, and this helpline's own rows always win.
#
# Tables (the global pipeline maps the columns to the attributes the dashboards and monitors use):
#   accounts      account_sid, short_code (-> account_short_code, e.g. USNM), env (-> account_env, e.g. PROD)
#   studio_flows  flow_sid, short_code, env, flow_name (-> flow_name, <code>_<env>_<flow key>, e.g. usnm_prod_sms)
locals {
  datadog_tagging_enabled = var.enable_datadog_tagging && var.twilio_account_sid != "" && var.datadog_tags_bucket != ""
  datadog_tags_prefix     = "helpline-tags"
  datadog_tags_own_file   = "${lower(var.short_helpline)}_${lower(var.short_environment)}.csv"

  datadog_flow_prefix = "${lower(var.short_helpline)}_${lower(var.short_environment)}"
  datadog_flow_labels = merge(
    { for channel, config in var.channel_studio_flow_sids : config.flow_sid => "${local.datadog_flow_prefix}_${channel}" if config.flow_sid != "" },
    { for name, flow_sid in var.studio_flow_sids : flow_sid => "${local.datadog_flow_prefix}_${name}" if flow_sid != "" }
  )

  datadog_tag_tables = {
    accounts = {
      folder      = "accounts"
      merged_file = "aselo_twilio_accounts.csv"
      columns     = ["account_sid", "short_code", "env"]
      rows = {
        (var.twilio_account_sid) = { account_sid = var.twilio_account_sid, short_code = var.short_helpline, env = var.short_environment }
      }
    }
    studio_flows = {
      folder      = "studio-flows"
      merged_file = "aselo_twilio_studio_flows.csv"
      columns     = ["flow_sid", "short_code", "env", "flow_name"]
      rows = {
        for flow_sid, label in local.datadog_flow_labels :
        flow_sid => { flow_sid = flow_sid, short_code = var.short_helpline, env = var.short_environment, flow_name = label }
      }
    }
  }

  # Other helplines' files (and the seed), by S3 key -> table
  datadog_other_files = local.datadog_tagging_enabled ? merge(concat([{}], [
    for table in keys(local.datadog_tag_tables) : {
      for key in data.aws_s3_objects.datadog_helpline_tags[table].keys :
      key => table if key != "${local.datadog_tags_prefix}/${local.datadog_tag_tables[table].folder}/${local.datadog_tags_own_file}" && endswith(key, ".csv")
    }
  ])...) : {}

  # Per table: other helplines' rows (files in sorted order), then this helpline's rows on top
  datadog_all_rows = {
    for table, config in local.datadog_tag_tables : table => merge(
      merge(concat([{}], [
        for key in sort(keys(local.datadog_other_files)) : {
          for row in csvdecode(data.aws_s3_object.datadog_helpline_tags[key].body) : row[config.columns[0]] => row
        } if local.datadog_other_files[key] == table
      ])...),
      config.rows
    )
  }

  datadog_csv = {
    for table, config in local.datadog_tag_tables : table => {
      own = join("\n", concat([join(",", config.columns)], [
        for id in sort(keys(config.rows)) : join(",", [for column in config.columns : config.rows[id][column]])
      ]))
      all = join("\n", concat([join(",", config.columns)], [
        for id in sort(keys(local.datadog_all_rows[table])) : join(",", [for column in config.columns : local.datadog_all_rows[table][id][column]])
      ]))
    }
  }
}

data "aws_s3_objects" "datadog_helpline_tags" {
  for_each = local.datadog_tagging_enabled ? local.datadog_tag_tables : {}
  bucket   = var.datadog_tags_bucket
  prefix   = "${local.datadog_tags_prefix}/${each.value.folder}/"
}

data "aws_s3_object" "datadog_helpline_tags" {
  for_each = local.datadog_other_files
  bucket   = var.datadog_tags_bucket
  key      = each.key
}

resource "aws_s3_object" "datadog_helpline_tags_own" {
  for_each     = local.datadog_tagging_enabled ? local.datadog_tag_tables : {}
  bucket       = var.datadog_tags_bucket
  key          = "${local.datadog_tags_prefix}/${each.value.folder}/${local.datadog_tags_own_file}"
  content      = "${local.datadog_csv[each.key].own}\n"
  content_type = "text/csv"
}

# Shared files: every helpline's state writes them, so plans show a change here whenever another
# helpline applied since. That's expected.
resource "aws_s3_object" "datadog_helpline_tags_all" {
  for_each     = local.datadog_tagging_enabled ? local.datadog_tag_tables : {}
  bucket       = var.datadog_tags_bucket
  key          = each.value.merged_file
  content      = "${local.datadog_csv[each.key].all}\n"
  content_type = "text/csv"
}
