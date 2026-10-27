# What the deploy workflow needs. None of these are secret.
output "url" {
  value = "https://${var.domain}"
}

output "site_bucket" {
  value = aws_s3_bucket.site.id
}

output "drafts_bucket" {
  value = aws_s3_bucket.drafts.id
}

output "lambda_function" {
  value = aws_lambda_function.api.function_name
}

output "cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.this.id
}
