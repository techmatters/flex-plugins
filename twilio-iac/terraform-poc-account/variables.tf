variable "local_os" {
  description = "The OS running the terraform script. The only value that currently changes behaviour from default is 'Windows'"
  type        = string
  default     = "Linux"
}

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

variable "messaging_flow_contact_identity" {
  default = "+18506053963"
}
