variable "uses_conversation_service" {
  default = true
  type = bool
  description = "Tells Terraform if the service being used is Flex Conversations Service"
}

variable "local_os" {
  description = "The OS running the terraform script. The only value that currently changes behaviour from default is 'Windows'"
  type        = string
  default = "Linux"
}

variable "helpline" {
  description = "Full capitalised helpline name"
  type        = string
}

variable "short_helpline" {
  description = "Short (usually 2 letter) upper case code for helpline"
  type        = string
}

variable "environment" {
  description = "Full capitalised environment name, typically 'Production', 'Staging' or 'Development'"
  type        = string
}

variable "short_environment" {
  description = "Short upper case environment identifier, typically 'PROD', 'STG' or 'DEV'"
  type        = string
}

variable "stage" {
  description = "Set to stage for terragrunt runs"
  type = string
  default = ""
}