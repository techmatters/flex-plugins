output "app_id" {
  value = okta_app_saml.this.id
}

output "label" {
  value = okta_app_saml.this.label
}

# The three values entered in Twilio Console > Flex > Single sign-on (SSO)
output "flex_sso_settings" {
  description = "Values for the Flex SSO page: Identity Provider Issuer, Single Sign-on URL, X.509 Certificate."
  value = {
    identity_provider_issuer = okta_app_saml.this.entity_url
    single_sign_on_url       = okta_app_saml.this.http_post_binding
    x509_certificate         = okta_app_saml.this.certificate
  }
}

output "metadata_url" {
  value = okta_app_saml.this.metadata_url
}

output "attribute_names" {
  description = "Attribute statement names sent to Flex."
  value       = [for attr in local.attributes : attr.name]
}
