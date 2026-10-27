# Copyright (C) 2021-2026 Technology Matters
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published
# by the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see https://www.gnu.org/licenses/.

variable "domain" {
  description = "Where the builder is served. Must be in the Route 53 zone below."
  type        = string
  default     = "form-builder.tl.techmatters.org"
}

variable "dns_zone_name" {
  description = "Route 53 hosted zone (in this account) for the domain and its certificate."
  type        = string
  default     = "tl.techmatters.org"
}

variable "name" {
  description = "Prefix for resource names."
  type        = string
  default     = "form-builder"
}

variable "okta_state" {
  description = "Where the Okta stage's state is, for the issuer and client id."
  type = object({
    bucket   = string
    key      = string
    role_arn = string
  })
}

variable "github_actions_user" {
  description = "The IAM user flex-plugins' GitHub workflows use; it gets permission to deploy the builder."
  type        = string
  default     = "github-actions"
}

variable "ssm_prefix" {
  description = "SSM Parameter Store path for the builder's secrets (the Slack webhook)."
  type        = string
  default     = "/form-builder"
}
