terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.11.1"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.74"
    }
  }
}

provider "aws" {
  alias = "bucket"
  region = var.bucket_region
}


locals {
  docs_s3_location = "tl-aselo-docs-${lower(var.short_helpline)}-${lower(var.environment)}"
  chat_s3_location = "tl-public-chat-${lower(var.short_helpline)}-${lower(var.short_environment)}"
}

resource "aws_s3_bucket" "docs" {
  bucket = local.docs_s3_location
  provider = aws.bucket
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "POST", "PUT"]
    allowed_origins = ["https://flex.twilio.com"]
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
    allowed_origins = ["https://flex.twilio.com"]
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

// Still put SSM parameters in default region, they don't store any helpline data & it keeps the workflow logic simpler
resource "aws_ssm_parameter" "main_group" {
  for_each = {
    WORKSPACE_SID = jsonencode(["TWILIO", var.flex_task_assignment_workspace_sid, "Twilio account - Workspace SID"])
    CHAT_WORKFLOW_SID = jsonencode(["TWILIO", var.master_workflow_sid, "Twilio account - Chat transfer workflow SID"])
    SYNC_SID = jsonencode(["TWILIO", var.shared_state_sync_service_sid, "Twilio account - Sync service "])
    // API Key secrets are not accessible from the twilio terraform provider
    // SECRET = jsonencode(["TWILIO", "NOT_SET", "Twilio account - Sync API secret"])
    CHAT_SERVICE_SID = jsonencode(["TWILIO", var.flex_chat_service_sid, "Twilio account - Chat service SID"])
    FLEX_PROXY_SERVICE_SID = jsonencode(["TWILIO", var.flex_proxy_service_sid, "Twilio account - Flex Proxy service SID"])
    SURVEY_WORKFLOW_SID =  jsonencode(["TWILIO", var.survey_workflow_sid, "Twilio account - Survey Workflow SID"])
    // API Key secrets are not accessible from the twilio terraform provider
    // HRM_STATIC_KEY = jsonencode(["TWILIO", "NOT_SET", "Twilio account - HRM static secret to perform backend calls"])
    S3_BUCKET_DOCS = jsonencode(["TWILIO", local.docs_s3_location, "Twilio account - Post Survey bot chat url"])
    POST_SURVEY_BOT_CHAT_URL = jsonencode(["TWILIO", "https://channels.autopilot.twilio.com/v1/${var.account_sid}/${var.post_survey_bot_sid}/twilio-chat", "Twilio account - Post Survey bot chat url"])
    OPERATING_INFO_KEY = jsonencode(["TWILIO", var.operating_info_key, "Twilio account - Operating Key info"])
    APP_ID = jsonencode(["DATADOG", var.datadog_app_id, "Datadog - Application ID"])
    ACCESS_TOKEN = jsonencode(["DATADOG", var.datadog_access_token, "Datadog - Access Token"])

  }
  # Deserialise the JSON used for the keys - this way we can have multiple values per key
  name  = "${var.short_environment}_${jsondecode(each.value)[0]}_${var.short_helpline}_${each.key}"
  type  = "SecureString"
  value = jsondecode(each.value)[1]
  description = jsondecode(each.value)[2]
}