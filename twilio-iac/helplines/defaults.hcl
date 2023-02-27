locals {
  region = "us-east-1"
  bucket_region = "us-east-1"
  cloudwatch_region = "us-east-1"

  multi_office = false
  enable_post_survey = false
  target_task_name = "greeting"
  twilio_numbers = []
  channel = ""

  custom_channels = []

  custom_task_routing_filter_expression = "channelType ==\"web\"  OR isContactlessTask == true OR  twilioNumber IN [${join(", ", formatlist("'%s'", local.twilio_numbers))}]"
}