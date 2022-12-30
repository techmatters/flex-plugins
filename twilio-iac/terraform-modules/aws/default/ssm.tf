resource "aws_ssm_parameter" "datadog_app_id" {
  name  = "/${lower(var.environment)}/datadog/${nonsensitive(var.twilio_account_sid)}/app_id"
  type  = "SecureString"
  value = var.datadog_app_id
  description = "Datadog - Application ID"

  tags = {
    Environment = lower(var.environment)
    Name = "/${lower(var.environment)}/datadog/${nonsensitive(var.twilio_account_sid)}/app_id"
    Terraform = true
  }
}

resource "aws_ssm_parameter" "datadog_access_token" {
  name  = "/${lower(var.environment)}/datadog/${nonsensitive(var.twilio_account_sid)}/access_token"
  type  = "SecureString"
  value = var.datadog_access_token
  description = "Datadog - Access Token"

  tags = {
    Environment = lower(var.environment)
    Name = "/${lower(var.environment)}/datadog/${nonsensitive(var.twilio_account_sid)}/access_token"
    Terraform = true
  }
}

resource "aws_ssm_parameter" "s3_docs_bucket_id" {
  name  = "/${lower(var.environment)}/s3/${nonsensitive(var.twilio_account_sid)}/docs_bucket_name"
  type  = "SecureString"
  value = local.docs_s3_location
  description = "S3 - Docs bucket name"

  tags = {
    Environment = lower(var.environment)
    Name = "/${lower(var.environment)}/s3/${nonsensitive(var.twilio_account_sid)}/docs_bucket_name"
    Terraform = true
  }
}

resource "aws_ssm_parameter" "serverless_base_url" {
  name  = "/${lower(var.environment)}/serverless/${nonsensitive(var.twilio_account_sid)}/base_url"
  type  = "SecureString"
  value = var.serverless_url
  description = "Serverless - Base URL"

  tags = {
    Environment = lower(var.environment)
    Name = "/${lower(var.environment)}/serverless/${nonsensitive(var.twilio_account_sid)}/base_url"
    Terraform = true
  }
}

resource "aws_ssm_parameter" "twilio_auth_token" {
  name  = "/${lower(var.environment)}/twilio/${nonsensitive(var.twilio_account_sid)}/auth_token"
  type  = "SecureString"
  value = var.twilio_auth_token
  description = "Twilio account - Auth Token"

  tags = {
    Environment = lower(var.environment)
    Name = "/${lower(var.environment)}/twilio/${nonsensitive(var.twilio_account_sid)}/auth_token"
    Terraform = true
  }
}

resource "aws_ssm_parameter" "twilio_workspace_sid" {
  name  = "/${lower(var.environment)}/twilio/${nonsensitive(var.twilio_account_sid)}/workspace_sid"
  type  = "SecureString"
  value = var.master_workflow_sid
  description = "Twilio account - Workspace SID"

  tags = {
    Environment = lower(var.environment)
    Name = "/${lower(var.environment)}/twilio/${nonsensitive(var.twilio_account_sid)}/workspace_sid"
    Terraform = true
  }
}

resource "aws_ssm_parameter" "twilio_chat_workflow_sid" {
  name  = "/${lower(var.environment)}/twilio/${nonsensitive(var.twilio_account_sid)}/chat_workflow_sid"
  type  = "SecureString"
  value = var.master_workflow_sid
  description = "Twilio account - Chat Workflow SID"

  tags = {
    Environment = lower(var.environment)
    Name = "/${lower(var.environment)}/twilio/${nonsensitive(var.twilio_account_sid)}/chat_workflow_sid"
    Terraform = true
  }
}


resource "aws_ssm_parameter" "twilio_sync_sid" {
  name  = "/${lower(var.environment)}/twilio/${nonsensitive(var.twilio_account_sid)}/sync_sid"
  type  = "SecureString"
  value = var.shared_state_sync_service_sid
  description = "Twilio account - Sync service SID"

  tags = {
    Environment = lower(var.environment)
    Name = "/${lower(var.environment)}/twilio/${nonsensitive(var.twilio_account_sid)}/sync_sid"
    Terraform = true
  }
}

resource "aws_ssm_parameter" "twilio_chat_service_sid" {
  name  = "/${lower(var.environment)}/twilio/${nonsensitive(var.twilio_account_sid)}/chat_service_sid"
  type  = "SecureString"
  value = var.flex_chat_service_sid
  description = "Twilio account - Chat service SID"

  tags = {
    Environment = lower(var.environment)
    Name = "/${lower(var.environment)}/twilio/${nonsensitive(var.twilio_account_sid)}/chat_service_sid"
    Terraform = true
  }
}


resource "aws_ssm_parameter" "twilio_flex_proxy_service_sid" {
  name  = "/${lower(var.environment)}/twilio/${nonsensitive(var.twilio_account_sid)}/flex_proxy_service_sid"
  type  = "SecureString"
  value = var.flex_proxy_service_sid
  description = "Twilio account - Flex Proxy service SID"

  tags = {
    Environment = lower(var.environment)
    Name = "/${lower(var.environment)}/twilio/${nonsensitive(var.twilio_account_sid)}/flex_proxy_service_sid"
    Terraform = true
  }
}

resource "aws_ssm_parameter" "twilio_survey_workflow_sid" {
  name  = "/${lower(var.environment)}/twilio/${nonsensitive(var.twilio_account_sid)}/survey_workflow_sid"
  type  = "SecureString"
  value = var.survey_workflow_sid
  description = "Twilio account - Survey Workflow SID"

  tags = {
    Environment = lower(var.environment)
    Name = "/${lower(var.environment)}/twilio/${nonsensitive(var.twilio_account_sid)}/survey_workflow_sid"
    Terraform = true
  }
}

resource "aws_ssm_parameter" "twilio_post_survey_bot_chat_url" {
  name  = "/${lower(var.environment)}/twilio/${nonsensitive(var.twilio_account_sid)}/post_survey_bot_chat_url"
  type  = "SecureString"
  value = "https://channels.autopilot.twilio.com/v1/${nonsensitive(var.twilio_account_sid)}/${var.post_survey_bot_sid}/twilio-chat"
  description = "Twilio account - Post Survey Bot Chat URL"

  tags = {
    Environment = lower(var.environment)
    Name = "/${lower(var.environment)}/twilio/${nonsensitive(var.twilio_account_sid)}/post_survey_bot_chat_url"
    Terraform = true
  }
}

resource "aws_ssm_parameter" "twilio_operating_info_key" {
  name  = "/${lower(var.environment)}/twilio/${nonsensitive(var.twilio_account_sid)}/operating_info_key"
  type  = "SecureString"
  value = var.operating_info_key
  description = "Twilio account - Operating Info Key"

  tags = {
    Environment = lower(var.environment)
    Name = "/${lower(var.environment)}/twilio/${nonsensitive(var.twilio_account_sid)}/operating_info_key"
    Terraform = true
  }
}