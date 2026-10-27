# Drafts: private and versioned, so earlier saves can be recovered from the console
resource "aws_s3_bucket" "drafts" {
  bucket = "tl-${var.name}-drafts"
}

resource "aws_s3_bucket_public_access_block" "drafts" {
  bucket                  = aws_s3_bucket.drafts.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "drafts" {
  bucket = aws_s3_bucket.drafts.id
  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_versioning" "drafts" {
  bucket = aws_s3_bucket.drafts.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Every save makes a version; older versions are kept for 90 days
resource "aws_s3_bucket_lifecycle_configuration" "drafts" {
  bucket = aws_s3_bucket.drafts.id

  rule {
    id     = "expire-old-versions"
    status = "Enabled"
    filter {}

    noncurrent_version_expiration {
      noncurrent_days = 90
    }
  }
}

# The API's Lambda (server/lambda.ts)
resource "aws_iam_role" "api" {
  name = "${var.name}-api"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "api" {
  name = "${var.name}-api"
  role = aws_iam_role.api.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "Logs"
        Effect   = "Allow"
        Action   = ["logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "${aws_cloudwatch_log_group.api.arn}:*"
      },
      {
        Sid      = "ListDrafts"
        Effect   = "Allow"
        Action   = "s3:ListBucket"
        Resource = aws_s3_bucket.drafts.arn
      },
      {
        Sid      = "ReadAndWriteDrafts"
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
        Resource = "${aws_s3_bucket.drafts.arn}/*"
      },
      {
        Sid      = "ReadSecrets"
        Effect   = "Allow"
        Action   = ["ssm:GetParameters", "ssm:GetParameter"]
        Resource = "arn:aws:ssm:us-east-1:${data.aws_caller_identity.current.account_id}:parameter${var.ssm_prefix}/*"
      },
    ]
  })
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/aws/lambda/${var.name}-api"
  retention_in_days = 30
}

# Placeholder until the deploy workflow uploads the real code
data "archive_file" "placeholder" {
  type        = "zip"
  output_path = "${path.module}/placeholder.zip"

  source {
    filename = "index.mjs"
    content  = "export const handler = async () => ({ statusCode: 503, body: JSON.stringify({ message: 'The form builder API has not been deployed yet.' }) });\n"
  }
}

resource "aws_lambda_function" "api" {
  function_name = "${var.name}-api"
  role          = aws_iam_role.api.arn
  runtime       = "nodejs22.x"
  architectures = ["arm64"]
  handler       = "index.handler"
  filename      = data.archive_file.placeholder.output_path
  # Unpacking master is quicker with more memory (which also means more CPU)
  memory_size = 1024
  timeout     = 29

  environment {
    variables = {
      DRAFTS_BUCKET = aws_s3_bucket.drafts.id
      APP_URL       = "https://${var.domain}"
      SSM_PREFIX    = var.ssm_prefix
    }
  }

  depends_on = [aws_cloudwatch_log_group.api]

  lifecycle {
    # The code is deployed by the GitHub workflow, not by Terraform
    ignore_changes = [filename, source_code_hash]
  }
}

resource "aws_apigatewayv2_api" "this" {
  name          = "${var.name}-api"
  protocol_type = "HTTP"
  description   = "Aselo Form Builder API (served through CloudFront at https://${var.domain}/api)"
}

# Only requests with a valid access token from the builder's Okta authorization server get through
resource "aws_apigatewayv2_authorizer" "okta" {
  api_id           = aws_apigatewayv2_api.this.id
  name             = "okta"
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]

  jwt_configuration {
    issuer   = local.okta_issuer
    audience = [local.okta_audience]
  }
}

resource "aws_apigatewayv2_integration" "api" {
  api_id                 = aws_apigatewayv2_api.this.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.api.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "api" {
  api_id             = aws_apigatewayv2_api.this.id
  route_key          = "ANY /api/{proxy+}"
  target             = "integrations/${aws_apigatewayv2_integration.api.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.okta.id
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.this.id
  name        = "$default"
  auto_deploy = true

  default_route_settings {
    throttling_burst_limit = 50
    throttling_rate_limit  = 20
  }
}

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowApiGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.this.execution_arn}/*/*"
}

# Lets flex-plugins' GitHub workflows deploy the builder (the page and the Lambda's code) and
# nothing else of it
resource "aws_iam_user_policy" "github_deploy" {
  name = "${var.name}-deploy"
  user = var.github_actions_user
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "ListSite"
        Effect   = "Allow"
        Action   = "s3:ListBucket"
        Resource = aws_s3_bucket.site.arn
      },
      {
        Sid      = "UploadSite"
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
        Resource = "${aws_s3_bucket.site.arn}/*"
      },
      {
        Sid      = "DeployApi"
        Effect   = "Allow"
        Action   = ["lambda:UpdateFunctionCode", "lambda:GetFunction", "lambda:GetFunctionConfiguration"]
        Resource = aws_lambda_function.api.arn
      },
      {
        Sid      = "RefreshSite"
        Effect   = "Allow"
        Action   = "cloudfront:CreateInvalidation"
        Resource = aws_cloudfront_distribution.this.arn
      },
      {
        Sid      = "FindTheDistribution"
        Effect   = "Allow"
        Action   = "cloudfront:ListDistributions"
        Resource = "*"
      },
    ]
  })
}
