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

/**
 * Recordings for the helplines' Studio flows, managed in the flow designer
 * (form-builder/docs/flow-designer.md, "Where recordings are stored"):
 *
 *   recordings.tl.techmatters.org ── CloudFront ── S3 (private): <code>/staging/<file>
 *                                                                <code>/production/<file>
 *
 * Studio plays them from the public address, so they're public like a website's audio; the bucket
 * itself stays private. The page uploads to <code>/staging/ through signed links from the API; the
 * API copies a file to <code>/production/ when Aselo staff publish it, and refreshes CloudFront so
 * the new version is served straight away. Who uploaded, approved and published each file is kept
 * in the private drafts bucket, not here.
 */

resource "aws_s3_bucket" "recordings" {
  bucket = var.recordings_bucket
}

resource "aws_s3_bucket_public_access_block" "recordings" {
  bucket                  = aws_s3_bucket.recordings.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "recordings" {
  bucket = aws_s3_bucket.recordings.id
  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

# Replaced recordings can be recovered for a year
resource "aws_s3_bucket_versioning" "recordings" {
  bucket = aws_s3_bucket.recordings.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "recordings" {
  bucket = aws_s3_bucket.recordings.id

  rule {
    id     = "expire-old-versions"
    status = "Enabled"
    filter {}

    noncurrent_version_expiration {
      noncurrent_days = 365
    }
  }
}

# The page uploads straight to the bucket, with signed links from the API
resource "aws_s3_bucket_cors_configuration" "recordings" {
  bucket = aws_s3_bucket.recordings.id

  cors_rule {
    allowed_origins = ["https://${var.domain}"]
    allowed_methods = ["PUT"]
    allowed_headers = ["Content-Type"]
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_policy" "recordings" {
  bucket = aws_s3_bucket.recordings.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "CloudFrontReadsTheRecordings"
      Effect    = "Allow"
      Principal = { Service = "cloudfront.amazonaws.com" }
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.recordings.arn}/*"
      Condition = { StringEquals = { "AWS:SourceArn" = aws_cloudfront_distribution.recordings.arn } }
    }]
  })
}

# Certificate for the recordings address (CloudFront needs it in us-east-1)
resource "aws_acm_certificate" "recordings" {
  domain_name       = var.recordings_domain
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "recordings_certificate_validation" {
  for_each = {
    for option in aws_acm_certificate.recordings.domain_validation_options : option.domain_name => option
  }

  zone_id = data.aws_route53_zone.this.zone_id
  name    = each.value.resource_record_name
  type    = each.value.resource_record_type
  records = [each.value.resource_record_value]
  ttl     = 300
}

resource "aws_acm_certificate_validation" "recordings" {
  certificate_arn         = aws_acm_certificate.recordings.arn
  validation_record_fqdns = [for record in aws_route53_record.recordings_certificate_validation : record.fqdn]
}

resource "aws_cloudfront_origin_access_control" "recordings" {
  name                              = "${var.name}-recordings"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "recordings" {
  enabled         = true
  comment         = "Aselo helpline recordings (${var.recordings_domain})"
  aliases         = [var.recordings_domain]
  price_class     = "PriceClass_100"
  http_version    = "http2and3"
  is_ipv6_enabled = true

  origin {
    origin_id                = "recordings"
    domain_name              = aws_s3_bucket.recordings.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.recordings.id
  }

  # Cached at the edge; the API refreshes a file when it's replaced or published
  default_cache_behavior {
    target_origin_id       = "recordings"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = false
    cache_policy_id        = data.aws_cloudfront_cache_policy.optimized.id
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.recordings.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

resource "aws_route53_record" "recordings" {
  for_each = toset(["A", "AAAA"])

  zone_id = data.aws_route53_zone.this.zone_id
  name    = var.recordings_domain
  type    = each.key

  alias {
    name                   = aws_cloudfront_distribution.recordings.domain_name
    zone_id                = aws_cloudfront_distribution.recordings.hosted_zone_id
    evaluate_target_health = false
  }
}
