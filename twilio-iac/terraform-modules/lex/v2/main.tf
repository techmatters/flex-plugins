terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "5.84.0"
    }
  }
}

resource "aws_lexv2models_bot" "test_bot" {
  name        = "example"
  description = "Example description"
  data_privacy {
    child_directed = false
  }
  idle_session_ttl_in_seconds = 60
  role_arn                    = aws_iam_role.test_role.arn
  type                        = "Bot"

  tags = {
    foo = "bar"
  }
}

resource "aws_iam_role" "test_role" {
  name = "example"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "lexv2.amazonaws.com"
        }
      },
    ]
  })

  tags = {
    created_by = "aws"
  }
}