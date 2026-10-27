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

variable "helplines" {
  description = "Short codes of the helplines whose staff use the builder; each gets a form-builder-<code> group."
  type        = list(string)

  validation {
    condition     = alltrue([for code in var.helplines : can(regex("^[a-z0-9]+$", code))])
    error_message = "Helpline codes are lower case letters and digits, e.g. usnm."
  }
}

variable "domain" {
  description = "Where the builder is served."
  type        = string
  default     = "form-builder.tl.techmatters.org"
}

variable "allow_local_dev" {
  description = "Also allow sign-in from the local dev server (http://localhost:5180)."
  type        = bool
  default     = true
}
