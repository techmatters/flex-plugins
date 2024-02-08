variable "twilio_account_sid" {
  description = "Twilio Account SID"
  type        = string
}

variable "twilio_auth_token" {
  description = "Twilio Auth Token"
  type        = string
}

variable "helpline" {
  description = "Full capitalised helpline name"
  type        = string
}

variable "helpline_region" {
  description = "Full capitalised helpline region name"
  type        = string
  default     = "us-east-1"
}

variable "short_helpline" {
  description = "Short (usually 2 letter) upper case code for helpline"
  type        = string
}

variable "datadog_app_id" {
  description = "DataDog App ID for RUM"
  type        = string
}

variable "datadog_access_token" {
  description = "DataDog access token for RUM"
  type        = string
}

variable "operating_info_key" {
  description = "Operating info key for this helpline"
  type        = string
}

variable "environment" {
  description = "Full capitialised environment name, typically 'Production', 'Staging' or 'Development'"
  type        = string
}

variable "short_environment" {
  description = "Short upper case environment identifier, typically 'PROD', 'STG' or 'DEV'"
  type        = string
}

variable "flex_task_assignment_workspace_sid" {
  description = "Internal Twilio resource SID provided by another module"
  type        = string
}

variable "master_workflow_sid" {
  description = "Internal Twilio resource SID provided by another module"
  type        = string
}

variable "shared_state_sync_service_sid" {
  description = "Internal Twilio resource SID provided by another module"
  type        = string
}

variable "flex_chat_service_sid" {
  description = "Internal Twilio resource SID provided by another module"
  type        = string
}

variable "flex_proxy_service_sid" {
  description = "Internal Twilio resource SID provided by another module"
  type        = string
}

variable "survey_workflow_sid" {
  description = "Internal Twilio resource SID provided by another module"
  type        = string
}

variable "bucket_region" {
  description = "The region where the document & chat s3 buckets should be created"
  type        = string
  default     = "us-east-1"
}

variable "serverless_url" {
  description = "URL used to access Aselo Twilio serverless functions"
  type        = string
}