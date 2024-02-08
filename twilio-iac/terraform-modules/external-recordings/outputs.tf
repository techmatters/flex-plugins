output "iam_access_key_id" {
  value = nonsensitive(aws_ssm_parameter.access_key_id.value)
}

output "iam_secret_access_key_ssm_key" {
  value = aws_ssm_parameter.secret_access_key.name
}

output "bucket_url" {
  // TODO: this may need to be region specific
  value = nonsensitive("https://${var.bucket_name}.s3.amazonaws.com/${var.path}")
}
