variable "aws_region" {
  description = "AWS Deployment region"
  default = "us-east-1"
}

variable "aws_access_key" {}
variable "aws_secret_key" {}

provider "aws" {
  region  = var.aws_region
  access_key  = var.aws_access_key
  secret_key  = var.aws_secret_key
}

locals {
  docs_s3_location = "tl-aselo-docs-${lower(var.short_helpline)}-${lower(var.environment)}"
  chat_s3_location = "tl-public-chat-${lower(var.short_helpline)}-${lower(var.short_environment)}"
}

resource "aws_s3_bucket" "docs" {
  bucket = local.docs_s3_location
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "POST", "PUT"]
    allowed_origins = ["https://flex.twilio.com", "http://localhost:3000", "https://localhost:3000"]
    expose_headers = []
  }
}

resource "aws_s3_bucket_public_access_block" "docs" {
  bucket = aws_s3_bucket.docs.id
  block_public_acls = true
  ignore_public_acls = true
  block_public_policy = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket" "chat" {
  bucket = local.chat_s3_location
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "POST", "PUT"]
    allowed_origins = ["https://flex.twilio.com", "http://localhost:3000", "https://localhost:3000"]
    expose_headers = []
  }
}

resource "aws_s3_bucket_public_access_block" "chat" {
  bucket = aws_s3_bucket.chat.id
  block_public_acls = false
  ignore_public_acls = false
  block_public_policy = false
  restrict_public_buckets = false
}

resource "aws_ssm_parameter" "main_group" {
  for_each = {
    WORKSPACE_SID = jsonencode(["TWILIO", twilio_taskrouter_workspaces_v1.flex_task_assignment.sid, "Twilio account - Workspace SID"])
    CHAT_WORKFLOW_SID = jsonencode(["TWILIO", twilio_taskrouter_workspaces_workflows_v1.master_workflow.sid, "Twilio account - Chat transfer workflow SID"])
    SYNC_SID = jsonencode(["TWILIO", twilio_sync_services_v1.shared_state_service.sid, "Twilio account - Sync service "])
    // API Key secrets are not accessible from the twilio terraform provider
    // SECRET = jsonencode(["TWILIO", "NOT_SET", "Twilio account - Sync API secret"])
    CHAT_SERVICE_SID = jsonencode(["TWILIO", twilio_chat_services_v2.flex_chat_service.sid, "Twilio account - Chat service SID"])
    FLEX_PROXY_SERVICE_SID = jsonencode(["TWILIO", twilio_proxy_services_v1.flex_proxy_service.sid, "Twilio account - Flex Proxy servivice SID"])
    SURVEY_WORKFLOW_SID =  jsonencode(["TWILIO", twilio_taskrouter_workspaces_workflows_v1.survey_workflow.sid, "Twilio account - Survey Workflow SID"])
    // API Key secrets are not accessible from the twilio terraform provider
    // HRM_STATIC_KEY = jsonencode(["TWILIO", "NOT_SET", "Twilio account - HRM static secret to perform backend calls"])
    S3_BUCKET_DOCS = jsonencode(["TWILIO", local.docs_s3_location, "Twilio account - Post Survey bot chat url"])
    POST_SURVEY_BOT_CHAT_URL = jsonencode(["TWILIO", "https://channels.autopilot.twilio.com/v1/${var.account_sid}/${twilio_autopilot_assistants_v1.post_survey.sid}/twilio-chat", "Twilio account - Post Survey bot chat url"])
    OPERATING_INFO_KEY = jsonencode(["TWILIO", var.operating_info_key, "Twilio account - Operating Key info"])
    APP_ID = jsonencode(["DATADOG", var.datadog_app_id, "Datadog - Application ID"])
    ACCESS_TOKEN = jsonencode(["DATADOG", var.datadog_access_token, "Datadog - Access Token"])

  }
  name  = "${var.short_environment}_${jsondecode(each.value)[0]}_${var.short_helpline}_${each.key}"
  type  = "SecureString"
  value = jsondecode(each.value)[1]
  description = jsondecode(each.value)[2]
}