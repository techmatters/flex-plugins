variable "helpline" {
  description = "The human readable helpline name."
  type        = string
}

variable "environment" {
  description = "Environment identifier, typically 'production', 'staging' or 'development'"
  type        = string
}

variable "short_environment" {
  description = "Short upper case environment identifier, typically 'PROD', 'STG' or 'DEV'"
  type        = string
}

variable "region" {
  description = "AWS region to create the resources"
  type        = string
}


variable "short_region" {
  description = "AWS region to create the resources"
  type        = string
}

variable "ssm_region" {
  description = "AWS region to read the SSM parameters from"
  type        = string
  default     = 'us-east-1'
}

variable "short_helpline" {
  description = "Short (usually 2 letter) upper case code for helpline"
  type        = string
}

variable "channel" {
  description = "The custom channel type"
  type = string
}

variable "message_handler_lambdas" {
  description = "The list of message handler lambdas"
  type        = list(string)
  default     = ["native-message-to-flex-message", "flex-message-to-native-message"]
}