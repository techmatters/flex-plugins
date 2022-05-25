locals {
  email_threshold = "1"
  pager_duty_threshold = "5"
  pager_duty_arn = "arn:aws:sns:us-east-1:712893914485:AWS-PagerDuty-Endpoint"
  # TODO: Should we create Pager Duty SNS topic from Terraform?
}

variable "short_helpline" {
  description = "Short (usually 2 letter) upper case code for helpline"
  type        = string
}

# Pager Duty Alarm
resource "aws_cloudwatch_metric_alarm" "alarm_5xx_pager_duty" {
  count                     = var.environment == "production" ? 1 : 0 # Creates for production only
  alarm_name                = "${var.environment}-alb-5xx-pager-duty"
  comparison_operator       = "GreaterThanOrEqualToThreshold"
  evaluation_periods        = "1"
  datapoints_to_alarm       = "1"
  metric_name               = "HTTPCode_ELB_5XX_Count"
  namespace                 = "AWS/ApplicationELB"
  period                    = "1800"
  statistic                 = "Sum"
  threshold                 = "${local.pager_duty_threshold}"
  dimensions                = {
    LoadBalancer = var.hrm_alb
  }
  actions_enabled           = "true"
  alarm_description         = "${var.environment} received at least ${local.pager_duty_threshold} error 5XX in the past half hour. Sent Pager Duty notification."
  alarm_actions = [local.pager_duty_arn]
}