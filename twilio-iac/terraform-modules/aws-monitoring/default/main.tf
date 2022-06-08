locals {
  email_threshold = "1"
  pager_duty_threshold = "5"
  email_arn = var.email_arn == null ? "arn:aws:sns:${var.cloudwatch_region}:${var.aws_account_id}:AWS-${lower(var.environment)}-alarms" : var.email_arn
  pager_duty_arn = var.pager_duty_arn == null ? "arn:aws:sns:${var.cloudwatch_region}:${var.aws_account_id}:AWS-PagerDuty-Endpoint" : var.pager_duty_arn
  # TODO: Should we create Pager Duty SNS topic from Terraform?
}

provider "aws" {
  alias = "cloudwatch"
  region = var.cloudwatch_region
}


# Pager Duty Alarm
resource "aws_cloudwatch_metric_alarm" "alarm_twilio_pager_duty" {
  count                     = var.environment == "production" ? 1 : 0 # Creates for production only
  alarm_name                = "${lower(var.environment)}-twilio-reporter-${lower(var.short_helpline)}-pager-duty"
  comparison_operator       = "GreaterThanOrEqualToThreshold"
  evaluation_periods        = "1"
  datapoints_to_alarm       = "1"
  metric_name               = "${upper(var.environment)} ERROR x ACCOUNT"
  namespace                 = "Twilio Reporter"
  period                    = "3600"
  statistic                 = "Sum"
  threshold                 = local.pager_duty_threshold
  dimensions                = {
    "Name": "Account",
    "Value": "${upper(var.short_helpline)}_${upper(var.environment)}"
  }
  actions_enabled           = "true"
  alarm_description         = "${var.helpline} (${var.environment}) received at least ${local.pager_duty_threshold} Twilio errors in the past hour. Sent Pager Duty notification."
  alarm_actions = [local.pager_duty_arn]
  treat_missing_data = "notBreaching"
}

# Email Alarm
resource "aws_cloudwatch_metric_alarm" "alarm_twilio_email" {
  alarm_name                = "${lower(var.environment)}-twilio-reporter-${lower(var.short_helpline)}-email"
  comparison_operator       = "GreaterThanOrEqualToThreshold"
  evaluation_periods        = "1"
  datapoints_to_alarm       = "1"
  metric_name               = "${upper(var.environment)} ERROR x ACCOUNT"
  namespace                 = "Twilio Reporter"
  period                    = "3600"
  statistic                 = "Sum"
  threshold                 = local.email_threshold
  dimensions                = {
    "Name": "Account",
    "Value": "${upper(var.short_helpline)}_${upper(var.environment)}"
  }
  actions_enabled           = "true"
  alarm_description         = "${var.helpline} (${var.environment}) received at least ${local.email_threshold} Twilio errors in the past hour. Sent email notification."
  alarm_actions = [local.email_arn]
  treat_missing_data = "notBreaching"
}