data "aws_caller_identity" "current" {}

data "aws_ssm_parameter" "ecr_url" {
  name     = "/${var.environment}/twilio/${var.region}/custom-channel/${var.channel}/lambda/${var.name}/ecr-url"
}

locals {
  aws_account_id = data.aws_caller_identity.current.account_id
  full_name = "${var.environment}-${var.short_helpline}-${var.name}"

  ecr_url  = data.aws_ssm_parameter.ecr_url

  env_vars = merge(var.env_vars, {
    NODE_ENV = var.environment
    SSM_REGION = var.ssm_region
  })

  ecr_tag_id = 1
}

module "lambda" {
  source  = "terraform-aws-modules/lambda/aws"
  version = "v4.18.0"

  function_name = local.full_name

  // Lambda lists aren't filterable by tag, so we are cheating and adding the ecr_image to the description
  // so that we can use it at deploy time. This is a hack, but it works. Do not change the description
  // or you will break the deploy process.
  description = "ecr_image:${local.ecr_url}"
  publish     = false
  timeout     = var.timeout

  use_existing_cloudwatch_log_group = false
  attach_cloudwatch_logs_policy     = true

  create_package = false
  package_type   = "Image"
  image_uri      = "${local.ecr_url}:live"

  memory_size            = var.memory_size
  ephemeral_storage_size = var.ephemeral_storage_size
  maximum_retry_attempts = var.maximum_retry_attempts

  source_path = null

  vpc_subnet_ids                     = var.subnet_ids
  vpc_security_group_ids             = var.security_group_ids
  attach_network_policy              = true
  replace_security_groups_on_destroy = true
  replacement_security_group_ids     = var.security_group_ids

  environment_variables = local.env_vars

  // This ensures that the image has been created (either externally or within this module) before we try to create the lambda
  depends_on = [local.ecr_tag_id]

  tags = {
    Name = local.full_name
    helpline = var.short_helpline
    service = "custom-channel"
    channel = var.channel
    app     = var.name
  }
}

resource "aws_iam_policy" "this" {
  count       = var.policy_template != "" ? 1 : 0
  name        = "${local.full_name}-lambda-access"
  description = "Policy lambda microservice access to other AWS resources"
  policy = templatefile(var.policy_template, {
    helpline       = var.short_helpline
    environment    = var.environment
    region         = var.region
    name           = var.name
    aws_account_id = local.aws_account_id
  })
}

resource "aws_iam_role_policy_attachment" "this" {
  count      = var.policy_template != "" ? 1 : 0
  role       = module.lambda.lambda_role_name
  policy_arn = aws_iam_policy.this[0].arn
}
