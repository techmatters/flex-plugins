add data "aws_ssm_parameter" "secrets" {
  name = "/terraform/twilio-iac/${var.environment}/${var.short_helpline}/secrets.json"
}

locals {
  secrets = jsondecode(data.aws_ssm_parameter.secrets.value)
  stage   = "provision"
  vpc_data                          = data.terraform_remote_state.vpc.outputs
  private_subnets                   = local.vpc_data.private_subnets
  vpc_id                            = local.vpc_data.vpc_id
  hrm_data                          = data.terraform_remote_state.hrm.outputs
  internal_source_security_group_id = local.hrm_data.internal_source_security_group_id
}

provider "twilio" {
  username = local.secrets.twilio_account_sid
  password = local.secrets.twilio_auth_token
}


data "terraform_remote_state" "vpc" {
  backend = "s3"

  config = {
    bucket   = "tl-terraform-state-${var.environment}"
    key      = "infrastructure-config/${var.region}/vpc/terraform.tfstate"
    region   = "us-east-1"
    role_arn = var.iam_role
  }
}

module "hrmServiceIntegration" {
  source              = "../../hrmServiceIntegration/default"
  twilio_account_sid  = local.secrets.twilio_account_sid
  helpline            = var.helpline
  short_helpline      = upper(var.short_helpline)
  environment         = title(var.environment)
  short_environment   = var.short_environment
  stage               = local.stage
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
  activities                            = var.activities
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
  queue_transfers_workflow_sid       = try(module.taskRouter.workflow_sids["queue_transfers"],"NOTVALIDWORKFLOWSID")
  shared_state_sync_service_sid      = module.services.shared_state_sync_service_sid
  flex_chat_service_sid              = module.services.flex_chat_service_sid
  flex_proxy_service_sid             = module.services.flex_proxy_service_sid
  # The serverless deploy action assumes that this paramater exists, so in order not to break it
  # we need to add a non-valid workflow sid.
  survey_workflow_sid = try(module.taskRouter.workflow_sids.survey, "NOTVALIDWORKFLOWSID")
  #TODO: convert bucket_region to helpline_region (or, better yet,  pass in the correct provider)
  bucket_region       = var.helpline_region
  helpline_region     = var.helpline_region
  s3_lifecycle_rules  = var.s3_lifecycle_rules
}

# Integration test runner Lambda
module "integration_test_runner" {
  count                  = var.integration_tests_enabled ? 1 : 0
  source                 = "../../integration-test-runner"
  environment            = var.environment
  short_helpline         = upper(var.short_helpline)
  region                 = var.helpline_region
  alb_url                = var.integration_tests_alb_url
  schedule_expression    = "rate(3 hours)"
  # VPC configuration to be added from previous terraform stage outputs
  subnet_ids             = local.private_subnets
  security_group_ids     = [local.internal_source_security_group_id]
}
