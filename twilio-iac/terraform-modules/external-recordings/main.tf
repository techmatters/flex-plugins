data "aws_iam_policy_document" "this" {
  version = "2012-10-17"

  statement {
    sid         = "UploadUserDenyEverything"
    effect      = "Deny"
    not_actions = ["*"]
    resources   = ["*"]
  }

  statement {
    sid       = "UploadUserListBucketMultipartUploads"
    effect    = "Allow"
    actions   = ["s3:ListBucketMultipartUploads"]
    resources = ["arn:aws:s3:::${var.bucket_name}"]
  }

  statement {
    sid    = "UploadUserAllowPutObjectAndMultipartUpload"
    effect = "Allow"
    actions = [
      "s3:PutObject",
      "s3:AbortMultipartUpload",
      "s3:ListMultipartUploadParts"
    ]
    resources = ["arn:aws:s3:::${var.bucket_name}/${var.path}/*"]
  }
}

resource "aws_iam_user" "this" {
  name = "${lower(var.short_helpline)}-${var.environment}-twilio-external-recordings"

  tags = {
    environment = var.environment
    helpline    = var.short_helpline
    env         = var.environment
    Terraform   = true
  }
}

resource "aws_iam_user_policy" "this" {
  name   = "${var.short_helpline}-${var.environment}-twilio-external-recordings"
  user   = aws_iam_user.this.name
  policy = data.aws_iam_policy_document.this.json
}

resource "aws_iam_access_key" "this" {
  user = aws_iam_user.this.name
}

resource "aws_ssm_parameter" "access_key_id" {
  name        = "/${lower(var.environment)}/twilio/${nonsensitive(var.twilio_account_sid)}/external_recordings/access_key_id"
  type        = "SecureString"
  value       = aws_iam_access_key.this.id
  description = "Twilio account - Access Key ID"

  tags = {
    environment = var.environment
    helpline    = var.short_helpline
    env         = var.environment
    Terraform   = true
  }
}

resource "aws_ssm_parameter" "secret_access_key" {
  name        = "/${lower(var.environment)}/twilio/${nonsensitive(var.twilio_account_sid)}/external_recordings/secret_access_key"
  type        = "SecureString"
  value       = aws_iam_access_key.this.secret
  description = "Twilio account - Secret Access Key"

  tags = {
    environment = var.environment
    helpline    = var.short_helpline
    env         = var.environment
    Terraform   = true
  }
}

resource "aws_ssm_parameter" "external_recordings_enabled" {
  name        = "/${lower(var.environment)}/twilio/${nonsensitive(var.twilio_account_sid)}/external_recordings_enabled"
  type        = "SecureString"
  value       = "true"
  description = "Twilio account - External Recordings Enabled"

  tags = {
    environment = var.environment
    helpline    = var.short_helpline
    env         = var.environment
    Terraform   = true
  }
}
