variable "environment" {
  description = "The environment for the helpline."
  type        = string
}

variable "short_environment" {
  description = "The short code for the environment."
  type        = string
}

variable "short_helpline" {
  description = "The short code for the helpline."
  type        = string
}

variable "bucket_name" {
  description = "The name of the bucket to store the external recordings."
  type        = string
}

variable "twilio_account_sid" {
  description = "The Twilio account SID."
  type        = string
}

variable "path" {
  description = "The path in the S3 bucket."
  type        = string
  default     = "voice-recordings"
}
