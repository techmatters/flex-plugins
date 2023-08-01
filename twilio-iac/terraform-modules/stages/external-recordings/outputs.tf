output "iam_access_key_id" {
  value = module.external_recordings.iam_access_key_id
}

output "iam_secret_access_key_ssm_key" {
  value = module.external_recordings.iam_secret_access_key_ssm_key
}
