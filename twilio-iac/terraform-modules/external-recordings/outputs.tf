output "iam_access_key_id" {
  value = aws_ssm_parameter.access_key_id.value
}

output "iam_secret_access_key_ssm_key" {
  value = aws_ssm_parameter.secret_access_key.name
}
