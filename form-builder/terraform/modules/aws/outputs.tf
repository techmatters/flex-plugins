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

# What the deploy workflow needs. None of these are secret.
output "url" {
  value = "https://${var.domain}"
}

output "site_bucket" {
  value = aws_s3_bucket.site.id
}

output "drafts_bucket" {
  value = aws_s3_bucket.drafts.id
}

output "lambda_function" {
  value = aws_lambda_function.api.function_name
}

output "recordings_url" {
  value = "https://${var.recordings_domain}"
}

output "recordings_bucket" {
  value = aws_s3_bucket.recordings.id
}

output "recordings_distribution_id" {
  value = aws_cloudfront_distribution.recordings.id
}

output "cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.this.id
}
