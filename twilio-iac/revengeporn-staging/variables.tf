variable "local_os" {
  description = "The OS running the terraform script. The only value that currently changes behaviour from default is 'Windows'"
  type        = string
  default     = "Linux"
}

variable "helpline" {
  default = "RevengePorn"
}

variable "short_helpline" {
  default = "UK"
}

variable "operating_info_key" {
  default = "uk"
}

variable "environment" {
  default = "Staging"
}

variable "short_environment" {
  default = "STG"
}
