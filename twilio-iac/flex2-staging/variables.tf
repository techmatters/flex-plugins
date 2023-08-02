variable "local_os" {
  description = "The OS running the terraform script. The only value that currently changes behaviour from default is 'Windows'"
  type        = string
  default     = "Linux"
}

variable "helpline" {
  default = "Flex 2.0"
}

variable "short_helpline" {
  default = "F2"
}

variable "operating_info_key" {
  default = "f2"
}

variable "environment" {
  default = "Staging"
}

variable "short_environment" {
  default = "STG"
}

variable "messaging_flow_contact_identity" {
  default = "+19032895967"
}
