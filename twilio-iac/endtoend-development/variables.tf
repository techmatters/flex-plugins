variable "local_os" {
  description = "The OS running the terraform script. The only value that currently changes behaviour from default is 'Windows'"
  type        = string
  default     = "Linux"
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

variable "serverless_url" {
  description = "Twilio Serverless URL"
  type        = string
}

variable "service_sid" {
  description = "Twilio Serverless Service SID"
  type        = string
}

variable "environment_sid" {
  description = "Twilio Serverless Environment SID"
  type        = string
}

variable "capture_channel_with_bot_function_sid" {
  description = "Twilio Serverless Function capture_channel_with_bot SID"
  type        = string
}
