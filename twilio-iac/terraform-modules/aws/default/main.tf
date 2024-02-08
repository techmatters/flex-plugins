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
  alias  = "bucket"
  region = var.bucket_region
  assume_role {
    role_arn     = "arn:aws:iam::712893914485:role/tf-twilio-iac-${lower(var.environment)}"
    session_name = "tf-${basename(abspath(path.module))}"
  }
}

locals {
  docs_s3_location = "tl-aselo-docs-${lower(var.short_helpline)}-${lower(var.environment)}"
  chat_s3_location = "tl-public-chat-${lower(var.short_helpline)}-${lower(var.short_environment)}"
}

resource "aws_s3_bucket" "docs" {
  bucket   = local.docs_s3_location
  provider = aws.bucket
}

resource "aws_s3_bucket_public_access_block" "docs" {
  bucket                  = aws_s3_bucket.docs.id
  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
  restrict_public_buckets = true
  provider                = aws.bucket
}

resource "aws_s3_bucket_cors_configuration" "docs" {
  bucket   = aws_s3_bucket.docs.bucket
  provider = aws.bucket
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "POST", "PUT"]
    allowed_origins = ["https://flex.twilio.com"]
    expose_headers  = []
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "docs" {
  bucket   = aws_s3_bucket.docs.bucket
  provider = aws.bucket
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_ownership_controls" "docs" {
  bucket   = aws_s3_bucket.docs.bucket
  provider = aws.bucket
  rule {
    object_ownership = "ObjectWriter"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "hrm_export_expiry" {
  bucket = aws_s3_bucket.docs.bucket
  provider = aws.bucket
  rule {
    expiration {
      days = 30
    }
    filter {
      prefix = "hrm-data/"
    }
    id = "HRM Exported Data Expiration Policy"
    status = "Enabled"
  }

}

resource "aws_s3_bucket" "chat" {
  bucket   = local.chat_s3_location
  provider = aws.bucket
}

resource "aws_s3_bucket_public_access_block" "chat" {
  bucket                  = aws_s3_bucket.chat.id
  block_public_acls       = false
  ignore_public_acls      = false
  block_public_policy     = false
  restrict_public_buckets = false
  provider                = aws.bucket
}

resource "aws_s3_bucket_cors_configuration" "chat" {
  bucket   = aws_s3_bucket.chat.bucket
  provider = aws.bucket
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "POST", "PUT"]
    allowed_origins = ["https://flex.twilio.com"]
    expose_headers  = []
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "chat" {
  bucket   = aws_s3_bucket.chat.bucket
  provider = aws.bucket
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_ownership_controls" "chat" {
  bucket   = aws_s3_bucket.chat.bucket
  provider = aws.bucket
  rule {
    object_ownership = "ObjectWriter"
  }
}

locals {
  aws_ssm_parameters = {
    WORKSPACE_SID     = jsonencode(["TWILIO", var.flex_task_assignment_workspace_sid, "Twilio account - Workspace SID"])
    CHAT_WORKFLOW_SID = jsonencode(["TWILIO", var.master_workflow_sid, "Twilio account - Chat transfer workflow SID"])
    SYNC_SID          = jsonencode(["TWILIO", var.shared_state_sync_service_sid, "Twilio account - Sync service "])
    // API Key secrets are not accessible from the twilio terraform provider
    // SECRET = jsonencode(["TWILIO", "NOT_SET", "Twilio account - Sync API secret"])
    CHAT_SERVICE_SID       = jsonencode(["TWILIO", var.flex_chat_service_sid, "Twilio account - Chat service SID"])
    FLEX_PROXY_SERVICE_SID = jsonencode(["TWILIO", var.flex_proxy_service_sid, "Twilio account - Flex Proxy service SID"])
    SURVEY_WORKFLOW_SID    = jsonencode(["TWILIO", var.survey_workflow_sid, "Twilio account - Survey Workflow SID"])
    // API Key secrets are not accessible from the twilio terraform provider
    // HRM_STATIC_KEY = jsonencode(["TWILIO", "NOT_SET", "Twilio account - HRM static secret to perform backend calls"])
    S3_BUCKET_DOCS     = jsonencode(["TWILIO", local.docs_s3_location, "Twilio account - Post Survey bot chat url"])
    OPERATING_INFO_KEY = jsonencode(["TWILIO", var.operating_info_key, "Twilio account - Operating Key info"])
    APP_ID             = jsonencode(["DATADOG", var.datadog_app_id, "Datadog - Application ID"])
    ACCESS_TOKEN       = jsonencode(["DATADOG", var.datadog_access_token, "Datadog - Access Token"])
    }
}

/****************************************************************
 * WARNING:
 * All new ssm params should be in the new format matching the resources
 * in ./ssm.tf. This for_each block will be removed once all apps are
 * migrated to use the new format.
 ****************************************************************/
// params are going into the region specified by var.bucket_region
resource "aws_ssm_parameter" "main_group" {
  for_each = local.aws_ssm_parameters

  # Deserialise the JSON used for the keys - this way we can have multiple values per key
  # note: this can also be accomplished in a more "tf native" way by using an array of objects and a `for` loop.
  # see: https://github.com/techmatters/flex-plugins/blob/1edf877bba4760370af16f41045fa14956d5620f/twilio-iac/terraform-modules/aws/default/main.tf#L206
  name        = "${var.short_environment}_${jsondecode(each.value)[0]}_${var.short_helpline}_${each.key}"
  type        = "SecureString"
  value       = jsondecode(each.value)[1]
  description = jsondecode(each.value)[2]
}