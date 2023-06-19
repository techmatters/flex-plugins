terraform {
  required_providers {
    github = {
      source  = "hashicorp/github"
    }
  }
}


resource "github_actions_secret" "flex_twilio_account_sid" {
  plaintext_value = var.twilio_account_sid
  repository      = "flex-plugins"
  secret_name     = "${var.short_helpline}_${var.short_environment}_ACCOUNT_SID"
}

resource "github_actions_secret" "flex_twilio_auth_token" {
  plaintext_value = var.twilio_auth_token
  repository      = "flex-plugins"
  secret_name     = "${var.short_helpline}_${var.short_environment}_AUTH_TOKEN"
}

resource "github_actions_secret" "serverless_twilio_account_sid" {
  plaintext_value = var.twilio_account_sid
  repository      = "serverless"
  secret_name     = "${var.short_helpline}_${var.short_environment}_ACCOUNT_SID"
}

resource "github_actions_secret" "serverless_twilio_auth_token" {
  plaintext_value = var.twilio_auth_token
  repository      = "serverless"
  secret_name     = "${var.short_helpline}_${var.short_environment}_AUTH_TOKEN"
}

resource "github_actions_secret" "webchat_serverless_url" {
  plaintext_value = var.serverless_url
  repository      = "webchat"
  secret_name     = "${var.short_helpline}_${var.short_environment}_SERVERLESS_URL"
}