terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }
}

data "aws_ssm_parameter" "webhook_url_studio_errors" {
  name = "/${lower(var.environment)}/slack/webhook_url_studio_errors"
}

locals {
  #Marking this as non sensitive since we need to see the studio flow definition when running a plan to validate changes.
  webhook_url_studio_errors = nonsensitive(data.aws_ssm_parameter.webhook_url_studio_errors.value)
  lambda_twilio_account_scoped_url = nonsensitive(
  "https://hrm-${var.environment}${var.region == "eu-west-1" ? "-eu" : ""}.tl.techmatters.org/lambda/twilio/account-scoped/${var.twilio_account_sid}"
  )
}


resource "twilio_studio_flows_v2" "studio_flow" {
  for_each      = var.studio_flows
  friendly_name = "${title(replace(each.key, "_", " "))} Studio Flow"
  status        = "published"
  definition = templatefile(
    each.value.templatefile,
    {
      flow_description                           = "${title(replace(each.key, "_", " "))} Studio Flow",
      helpline                                   = var.helpline,
      task_language                              = var.task_language,
      flow_vars                                  = each.value.flow_vars,
      lambda_twilio_account_scoped_url           = local.lambda_twilio_account_scoped_url,
      workflow_sids                              = var.workflow_sids,
      task_channel_sids                          = var.task_channel_sids,
      webhook_url_studio_errors                  = local.webhook_url_studio_errors,
      short_helpline                             = var.short_helpline,
      short_environment                          = var.short_environment,
      environment                                = var.environment
    }
  )
}
