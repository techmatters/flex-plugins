output "iam_access_key_id" {
  value = var.enable_external_recordings ? module.external_recordings[0].iam_access_key_id : null
}

output "iam_secret_access_key_ssm_key" {
  value = var.enable_external_recordings ? module.external_recordings[0].iam_secret_access_key_ssm_key : null
}

output "short_helpline" {
  value = var.short_helpline
}

output "environment" {
  value = var.environment
}

output "bucket_url" {
  value = var.enable_external_recordings ? module.external_recordings[0].bucket_url : null
}
