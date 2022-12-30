terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.26.0"
    }
  }
}

provider "aws" {
  alias = "bucket"
  region = var.bucket_region
  assume_role {
    role_arn     = "arn:aws:iam::712893914485:role/tf-twilio-iac-${lower(var.environment)}"
    session_name = "tf-${basename(abspath(path.module))}"
  }
}

locals {
  docs_s3_location = "tl-aselo-docs-${lower(var.short_helpline)}-${lower(var.environment)}"
  chat_s3_location = "tl-public-chat-${lower(var.short_helpline)}-${lower(var.short_environment)}"
  ssm_parameters = [
    {
      service = "datadog"
      key_name = "app_id"
      value = nonsensitive(var.datadog_app_id)
      description = "Datadog - Application ID"
    },
    {
      service = "datadog"
      key_name = "access_token"
      value =  nonsensitive(var.datadog_access_token)
      description = "Datadog - Access Token"
    },
    {
      service = "s3"
      key_name = "docs_bucket_name"
      value = local.docs_s3_location
      description = "Twilio account - Post Survey bot chat url"
    },
    {
      service = "serverless"
      key_name = "base_url"
      value = var.serverless_url
      description = "Twilio serverless base url"
    },
    {
      service = "twilio"
      key_name = "auth_token"
      value =  nonsensitive(var.twilio_auth_token)
      description = "Twilio account - Auth Token"
    },
    {
      service = "twilio"
      key_name = "workspace_sid"
      value = var.flex_task_assignment_workspace_sid
      description = "Twilio account - Workspace SID"
    },
    {
      service = "twilio"
      key_name = "chat_workflow_sid"
      value = var.master_workflow_sid
      description = "Twilio account - Chat transfer workflow SID"
    },
    {
      service = "twilio"
      key_name = "sync_sid"
      value = var.shared_state_sync_service_sid
      description = "Twilio account - Sync service SID"
    },
    {
      service = "twilio"
      key_name = "chat_service_sid"
      value = var.flex_chat_service_sid
      description = "Twilio account - Chat service SID"
    },
    {
      service = "twilio"
      key_name = "flex_proxy_service_sid"
      value = var.flex_proxy_service_sid
      description = "Twilio account - Flex Proxy service SID"
    },
    {
      service = "twilio"
      key_name = "survey_workflow_sid"
      value = var.survey_workflow_sid
      description = "Twilio account - Survey Workflow SID"
    },
    {
      service = "twilio"
      key_name = "post_survey_bot_chat_url"
      value = "https://channels.autopilot.twilio.com/v1/${nonsensitive(var.twilio_account_sid)}/${var.post_survey_bot_sid}/twilio-chat"
      description = "Twilio account - Post Survey bot chat url"
    },
    {
      service = "twilio"
      key_name = "operating_info_key"
      value = var.operating_info_key
      description = "Twilio account - Operating Key info"
    }
  ]
}

resource "aws_s3_bucket" "docs" {
  bucket = local.docs_s3_location
  provider = aws.bucket
}

resource "aws_s3_bucket_public_access_block" "docs" {
  bucket = aws_s3_bucket.docs.id
  block_public_acls = true
  ignore_public_acls = true
  block_public_policy = true
  restrict_public_buckets = true
  provider = aws.bucket
}

resource "aws_s3_bucket_cors_configuration" "docs" {
  bucket = aws_s3_bucket.docs.bucket
  provider = aws.bucket
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "POST", "PUT"]
    allowed_origins = ["https://flex.twilio.com"]
    expose_headers = []
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "docs" {
  bucket = aws_s3_bucket.docs.bucket
  provider = aws.bucket
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "AES256"
    }
  }
}

resource "aws_s3_bucket" "chat" {
  bucket = local.chat_s3_location
  provider = aws.bucket
}

resource "aws_s3_bucket_public_access_block" "chat" {
  bucket = aws_s3_bucket.chat.id
  block_public_acls = false
  ignore_public_acls = false
  block_public_policy = false
  restrict_public_buckets = false
  provider = aws.bucket
}

resource "aws_s3_bucket_cors_configuration" "chat" {
  bucket = aws_s3_bucket.chat.bucket
  provider = aws.bucket
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "POST", "PUT"]
    allowed_origins = ["https://flex.twilio.com"]
    expose_headers = []
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "chat" {
  bucket = aws_s3_bucket.chat.bucket
  provider = aws.bucket
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "AES256"
    }
  }
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
    POST_SURVEY_BOT_CHAT_URL = jsonencode(["TWILIO", "https://channels.autopilot.twilio.com/v1/${var.twilio_account_sid}/${var.post_survey_bot_sid}/twilio-chat", "Twilio account - Post Survey bot chat url"])
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

resource "aws_ssm_parameter" "this" {
  for_each = { for param in local.ssm_parameters : "${param.service}_${param.key_name}" => param }

  name  = "/${lower(var.environment)}/${each.value.service}/${nonsensitive(var.twilio_account_sid)}/${each.value.key_name}"
  type  = "SecureString"
  value = each.value.value
  description = each.value.description

  tags = {
    Environment = var.environment
    Name = "/${lower(var.environment)}/${each.value.service}/${nonsensitive(var.twilio_account_sid)}/${each.value.key_name}"
    Terraform = true
  }
}
