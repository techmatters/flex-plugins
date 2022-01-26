// Legacy file only kept to facilitate migration. Once all accounts have been migrated to use the module, delete me.
// Known accounts that require migration: aarambh production, safespot staging

moved {
  from = aws_s3_bucket.docs
  to = module.aws.aws_s3_bucket.docs
}

moved {
  from = aws_s3_bucket_public_access_block.docs
  to = module.aws.aws_s3_bucket_public_access_block.docs
}

moved {
  from = aws_s3_bucket.chat
  to = module.aws.aws_s3_bucket.chat
}

moved {
  from = aws_s3_bucket_public_access_block.chat
  to = module.aws.aws_s3_bucket_public_access_block.chat
}

moved {
  from = aws_ssm_parameter.main_group
  to = module.aws.aws_ssm_parameter.main_group
}
