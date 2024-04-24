locals {
  alb_paths        = var.alb_paths == null ? ["/lambda/custom-channels/${var.channel}/${var.name}"] : var.alb_paths
}

resource "aws_lambda_alias" "live" {
  name             = "live"
  description      = "Live alias for ${local.full_name}"
  function_name    = module.lambda.lambda_function_arn
  function_version = module.lambda.lambda_function_version
}

resource "aws_lb_target_group" "this" {
  name        = local.full_name
  target_type = "lambda"

  tags = {
    Terraform = true
    service   = "custom-channel"
    channel   = var.channel
    app       = var.name
  }
}

resource "aws_lambda_permission" "alb" {
  statement_id  = "AllowExecutionFromALB"
  action        = "lambda:InvokeFunction"
  function_name = module.lambda.lambda_function_name
  principal     = "elasticloadbalancing.amazonaws.com"
  qualifier     = aws_lambda_alias.live.name
  source_arn    = aws_lb_target_group.this.arn
}

resource "aws_lb_target_group_attachment" "main" {
  target_group_arn = aws_lb_target_group.this.arn
  target_id        = aws_lambda_alias.live.arn
  depends_on = [
    aws_lambda_permission.alb,
    aws_lambda_alias.live
  ]
}

resource "aws_lb_listener_rule" "main" {
  listener_arn = var.alb_listener_arn
  priority     = var.priority

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.this.arn
  }

  condition {
    path_pattern {
      values = local.alb_paths
    }
  }

  tags = {
    Terraform = true
    service   = "custom-channel"
    channel   = var.channel
    app       = var.name
  }
}
