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
  ui_editable        = var.ui_editable
}

module "services" {
  source            = "../../services/default"
  helpline          = var.helpline
  short_helpline    = upper(var.short_helpline)
  environment       = title(var.environment)
  short_environment = var.short_environment
  stage             = local.stage
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
  phone_numbers                         = var.phone_numbers
  workflow_vars                         = var.workflow_vars
}

module "survey" {
  source                             = "../../survey/default"
  count                              = var.enable_old_survey_module ? 1 : 0
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
  # The serverless deploy action assumes that this paramater exists, so in order not to break it
  # we need to add a non-valid workflow sid.
  survey_workflow_sid = try(module.taskRouter.workflow_sids.survey, "NOTVALIDWORKFLOWSID")
  #TODO: convert bucket_region to helpline_region (or, better yet,  pass in the correct provider)
  bucket_region                 = var.helpline_region
  helpline_region               = var.helpline_region
  s3_lifecycle_rules            = var.s3_lifecycle_rules
  queue_transfers_workflow_sid  = var.queue_transfers_workflow_sid
}

#TODO: Remove the provider and moved once this has been applied everywhere
provider "github" {
  owner = "techmatters"
}

moved {
  from = module.github
  to   = module.github[0]
}
