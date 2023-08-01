variable "local_os" {
  description = "The OS running the terraform script. The only value that currently changes behaviour from default is 'Windows'"
  type        = string
  default     = "Linux"
}

variable "helpline" {
  default = "Kids Help Phone"
}

variable "short_helpline" {
  default = "CA"
}

variable "operating_info_key" {
  default = "ca"
}

variable "environment" {
  default = "Staging"
}

variable "short_environment" {
  default = "STG"
}
