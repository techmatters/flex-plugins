variable "account_sid" {}
variable "auth_token" {}
variable "serverless_url" {}
variable "datadog_app_id" {}
variable "datadog_access_token" {}

variable "aws_account_id" {
  description = "Numeric AWS account ID used in ARNs"
  type        = string
}

variable "local_os" {
  description = "The OS running the terraform script. The only value that currently changes behaviour from default is 'Windows'"
  type        = string
  default = "Linux"
}

variable "helpline" {
  default = "End To End Testing"
}

variable "short_helpline" {
  default = "E2E"
}

variable "operating_info_key" {
  default = "e2e"
}

variable "environment" {
  default = "Development"
}

variable "short_environment" {
  default = "DEV"
}

variable "definition_version" {
  description = "Key that determines which set of form definitions this helpline will use"
  type        = string
  default = "demo-v1"
}

variable "permission_config" {
  description = "Key that determines which set of permission rules this helpline will use"
  type        = string
  default = "demo"
}

variable multi_office {
  default = false
  type = bool
  description = "Sets the multipleOfficeSupport flag in Flex Service Configuration"
}

variable "feature_flags" {
  description = "A map of feature flags that need to be set for this helpline's flex plugin"
  type = map(bool)
  default = {
    "enable_fullstory_monitoring": false,
    "enable_upload_documents": true,
    "enable_post_survey": false,
    "enable_case_management": true,
    "enable_offline_contact": true,
    "enable_filter_cases": true,
    "enable_sort_cases": true,
    "enable_transfers": true,
    "enable_manual_pulling": true,
    "enable_csam_report": true,
    "enable_canned_responses": true,
    "enable_dual_write": false,
    "enable_save_insights": true,
    "enable_previous_contacts": true
  }
}