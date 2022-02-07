variable "account_sid" {}
variable "serverless_url" {}
variable "datadog_app_id" {}
variable "datadog_access_token" {}

variable "local_os" {
  description = "The OS running the terraform script. The only value that currently changes behaviour from default is 'Windows'"
  type        = string
  default = "Linux"
}

variable "helpline" {
  default = "SafeSpot"
}
variable "short_helpline" {
  default = "JM"
}
variable "operating_info_key" {
  default = "jm"
}
variable "environment" {
  default = "Staging"
}
variable "short_environment" {
  default = "STG"
}

