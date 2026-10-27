/**
 * The form builder in AWS:
 *
 *   form-builder.tl.techmatters.org ── CloudFront ─┬─ /*      ── S3 (the page, private)
 *                                                  └─ /api/* ── API Gateway ── Lambda ── S3 (drafts)
 *
 * API Gateway checks the Okta access token before the Lambda runs (issuer and audience from the
 * Okta stage). The page and the API share one address, so there's no CORS.
 *
 * Terraform creates the Lambda with placeholder code and writes /config.json; the page and the
 * Lambda's real code are deployed by the "Deploy form builder" GitHub workflow, which builds them.
 */

data "aws_caller_identity" "current" {}

data "aws_route53_zone" "this" {
  name         = var.dns_zone_name
  private_zone = false
}

# The Okta app and authorization server (form-builder/terraform/okta)
data "terraform_remote_state" "okta" {
  backend = "s3"
  config = {
    bucket = var.okta_state.bucket
    key    = var.okta_state.key
    region = "us-east-1"
    assume_role = {
      role_arn = var.okta_state.role_arn
    }
  }
}

locals {
  okta_issuer    = data.terraform_remote_state.okta.outputs.issuer
  okta_client_id = data.terraform_remote_state.okta.outputs.client_id
  okta_audience  = data.terraform_remote_state.okta.outputs.audience
}

# Certificate for the domain (CloudFront needs it in us-east-1), validated through Route 53
resource "aws_acm_certificate" "this" {
  domain_name       = var.domain
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "certificate_validation" {
  for_each = {
    for option in aws_acm_certificate.this.domain_validation_options : option.domain_name => option
  }

  zone_id = data.aws_route53_zone.this.zone_id
  name    = each.value.resource_record_name
  type    = each.value.resource_record_type
  records = [each.value.resource_record_value]
  ttl     = 300
}

resource "aws_acm_certificate_validation" "this" {
  certificate_arn         = aws_acm_certificate.this.arn
  validation_record_fqdns = [for record in aws_route53_record.certificate_validation : record.fqdn]
}

resource "aws_route53_record" "site" {
  for_each = toset(["A", "AAAA"])

  zone_id = data.aws_route53_zone.this.zone_id
  name    = var.domain
  type    = each.key

  alias {
    name                   = aws_cloudfront_distribution.this.domain_name
    zone_id                = aws_cloudfront_distribution.this.hosted_zone_id
    evaluate_target_health = false
  }
}
