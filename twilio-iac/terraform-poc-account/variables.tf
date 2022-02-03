variable "account_sid" {}
variable "serverless_url" {}
variable "datadog_app_id" {}
variable "datadog_access_token" {}

variable "helpline" {
  default = "TerraformPOC"
}
variable "short_helpline" {
  default = "POC"
}
variable "operating_info_key" {
  default = "poc"
}
variable "environment" {
  default = "Development"
}
variable "short_environment" {
  default = "DEV"
}