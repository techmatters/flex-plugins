variable "helpline" {
  description = "The human readable helpline name."
  type        = string
}

variable "environment" {
  description = "Environment identifier, typically 'production', 'staging' or 'development'"
  type        = string
}

variable "region" {
  description = "AWS region to create the resources"
  type        = string
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
  default     = ["native-to-flex", "flex-to-native"]
}