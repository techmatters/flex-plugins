locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)

  en_us_slot_types = merge(
    jsondecode(file("/app/twilio-iac/helplines/configs/lex/en_US/slot_types/age.json")),
    jsondecode(file("/app/twilio-iac/helplines/configs/lex/en_US/slot_types/gender.json")),
    jsondecode(file("/app/twilio-iac/helplines/configs/lex/en_US/slot_types/yes_no.json")),
  )

  en_us_intents = merge(
    jsondecode(file("/app/twilio-iac/helplines/configs/lex/en_US/intents/post_survey.json")),
    jsondecode(file("/app/twilio-iac/helplines/configs/lex/en_US/intents/pre_survey.json")),
  )

  en_us_bots = merge(
    jsondecode(file("/app/twilio-iac/helplines/configs/lex/en_US/bots/post_survey.json")),
    jsondecode(file("/app/twilio-iac/helplines/configs/lex/en_US/bots/pre_survey.json")),
  )

  es_co_slot_types = merge(
    jsondecode(file("/app/twilio-iac/helplines/configs/lex/es_CO/slot_types/age.json")),
    jsondecode(file("/app/twilio-iac/helplines/configs/lex/es_CO/slot_types/gender.json")),
    jsondecode(file("/app/twilio-iac/helplines/configs/lex/es_CO/slot_types/yes_no.json")),
  )

  es_co_intents = merge(
    jsondecode(file("/app/twilio-iac/helplines/configs/lex/es_CO/intents/pre_survey.json")),
  )

  es_co_bots = merge(
    jsondecode(file("/app/twilio-iac/helplines/configs/lex/es_CO/bots/pre_survey.json")),
  )

  local_config = {
    helpline           = "Aselo"
    old_dir_prefix     = "aselo-as"
    definition_version = "as-v1"
    lex_bot_languages  = {
      en_US : {
        slot_types : local.en_us_slot_types
        intents    : local.en_us_intents
        bots       : local.en_us_bots
      }

      es_CO : {
        slot_types : local.es_co_slot_types
        intents    : local.es_co_intents
        bots       : local.es_co_bots
      }
    }
  }
}