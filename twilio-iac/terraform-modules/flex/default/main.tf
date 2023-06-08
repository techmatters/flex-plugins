terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }
}

locals {
  hrm_url           = var.hrm_url == "" ? (var.short_environment == "PROD" ? "https://hrm-production.tl.techmatters.org" : (var.short_environment == "STG" ? "https://hrm-staging.tl.techmatters.org" : "https://hrm-development.tl.techmatters.org")) : var.hrm_url
  permission_config = var.permission_config == "" ? var.operating_info_key : var.permission_config

  // This cmd_args hackery is temporary until all helplines are migrated to terragrunt or until these scripts are moved to post-apply/after hooks.
  cmd_args = var.stage == "" ? "--helplineDirectory=${basename(abspath(path.root))}" : "--stage=${var.stage} --helplineShortCode=${lower(var.short_helpline)} --helplineEnvironment=${lower(var.environment)}"
  service_configuration_payload = jsonencode({ "ui_attributes" : {
    "warmTransfers" : {
      "enabled" : true
    },
    "notifications" : {
      "browser" : true
    },
    "version_compatibility" : "yes",
    "colorTheme" : {
      "light" : true,
      "baseName" : "GreyLight",
      "preset" : {
        "id" : "mono-light",
        "name" : "Simple Light"
      },
      "overrides" : {
        "MainHeader" : {
          "Button" : {
            "color" : "#000000"
          },
          "Container" : {
            "color" : "#000000",
            "background" : "#FFFFFF"
          },
          "Icon" : {
            "color" : "#000000"
          }
        },
        "SideNav" : {
          "Button" : {
            "background" : "#FFFFFF"
          },
          "Container" : {
            "background" : "#FFFFFF"
          },
          "Icon" : {
            "color" : "#000000"
          }
        }
      }
    },
    "version_message" : ""
    },
    "account_sid" : var.twilio_account_sid,
    "attributes" : {
      "feature_flags" : var.feature_flags,
      "seenOnboarding" : true,
      "permissionConfig" : var.permission_config,
      "hrm_api_version" : "v0",
      "definitionVersion" : var.definition_version,
      "monitoringEnv" : "production",
      "hrm_base_url" : local.hrm_url,
      "pdfImagesSource" : "https://tl-public-chat.s3.amazonaws.com",
      "logo_url" : "https://aselo-logo.s3.amazonaws.com/145+transparent+background+no+TM.png",
      "multipleOfficeSupport" : var.multi_office_support,
      "serverless_base_url" : var.serverless_url,
      "helplineLanguage" : var.helpline_language
  } })
}

resource "twilio_flex_flex_flows_v1" "messaging_flow" {
  channel_type         = "sms"
  chat_service_sid     = var.flex_chat_service_sid
  friendly_name        = "Flex Messaging Channel Flow"
  integration_type     = "studio"
  integration_flow_sid = var.messaging_studio_flow_sid
  contact_identity     = var.messaging_flow_contact_identity
  enabled              = true
}
resource "twilio_flex_flex_flows_v1" "webchat_flow" {
  channel_type         = "web"
  chat_service_sid     = var.flex_chat_service_sid
  friendly_name        = "Flex Web Channel Flow"
  integration_type     = "studio"
  integration_flow_sid = var.messaging_studio_flow_sid
  enabled              = true
}

resource "null_resource" "service_configuration" {
  triggers = {
    configuration : local.service_configuration_payload
  }
  provisioner "local-exec" {
    environment = {
      TWILIO_FLEX_SERVICE_CONFIGURATION_PAYLOAD = local.service_configuration_payload
    }
    working_dir = "/app/scripts"
    command     = "npm run twilioResources -- update-flex-configuration ${local.cmd_args}"
  }
}
