data "aws_ssm_parameter" "secrets" {
  name = "/terraform/twilio-iac/${var.environment}/${var.short_helpline}/secrets.json"
}

locals {
  secrets = jsondecode(data.aws_ssm_parameter.secrets.value)
  stage   = "provision"
}

provider "twilio" {
  username = local.secrets.twilio_account_sid
  password = local.secrets.twilio_auth_token
}

module "hrmServiceIntegration" {
  source            = "../../hrmServiceIntegration/default"
  helpline          = var.helpline
  short_helpline    = upper(var.short_helpline)
  environment       = title(var.environment)
  short_environment = var.short_environment
  stage             = local.stage
}

module "serverless" {
  source             = "../../serverless/default"
  twilio_account_sid = local.secrets.twilio_account_sid
  twilio_auth_token  = local.secrets.twilio_auth_token
}

module "services" {
  source            = "../../services/default"
  helpline          = var.helpline
  short_helpline    = upper(var.short_helpline)
  environment       = title(var.environment)
  short_environment = var.short_environment
}

module "taskRouter" {
  source                                = "../../taskRouter/v1"
  helpline                              = var.helpline
  serverless_url                        = module.serverless.serverless_environment_production_url
  custom_task_routing_filter_expression = var.custom_task_routing_filter_expression
  events_filter                         = var.events_filter
  task_queues                           = var.task_queues
  workflows                             = var.workflows
  task_channels                         = var.task_channels
}

module "survey" {
  source                             = "../../survey/default"
  helpline                           = var.helpline
  flex_task_assignment_workspace_sid = module.taskRouter.flex_task_assignment_workspace_sid
}

module "aws" {
  source                             = "../../aws/default"
  twilio_account_sid                 = local.secrets.twilio_account_sid
  twilio_auth_token                  = local.secrets.twilio_auth_token
  serverless_url                     = module.serverless.serverless_environment_production_url
  helpline                           = var.helpline
  short_helpline                     = upper(var.short_helpline)
  environment                        = title(var.environment)
  short_environment                  = var.short_environment
  operating_info_key                 = var.operating_info_key
  datadog_app_id                     = local.secrets.datadog_app_id
  datadog_access_token               = local.secrets.datadog_access_token
  flex_task_assignment_workspace_sid = module.taskRouter.flex_task_assignment_workspace_sid
  master_workflow_sid                = module.taskRouter.workflow_sids["master"]
  shared_state_sync_service_sid      = module.services.shared_state_sync_service_sid
  flex_chat_service_sid              = module.services.flex_chat_service_sid
  flex_proxy_service_sid             = module.services.flex_proxy_service_sid
  # TODO: manually delete this resource from SSM after migration
  # post_survey_bot_sid = module.chatbots.post_survey_bot_sid
  survey_workflow_sid = module.survey.survey_workflow_sid
  bucket_region       = var.helpline_region
}

module "aws_monitoring" {
  source            = "../../aws-monitoring/default"
  helpline          = var.helpline
  short_helpline    = upper(var.short_helpline)
  environment       = title(var.environment)
  cloudwatch_region = var.aws_monitoring_region
}

provider "github" {
  owner = "techmatters"
}

module "github" {
  source = "../../github/default"

  count = var.manage_github_secrets ? 1 : 0

  twilio_account_sid = local.secrets.twilio_account_sid
  twilio_auth_token  = local.secrets.twilio_auth_token
  short_environment  = var.short_environment
  short_helpline     = upper(var.short_helpline)
  serverless_url     = module.serverless.serverless_environment_production_url
}

moved {
  from = module.github
  to   = module.github[0]
}
