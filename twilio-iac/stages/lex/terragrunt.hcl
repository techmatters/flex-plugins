/**
  * We import the terragrunt root config that handles most of the shared setup and
  * configuration for all of our stages
  */
include "root" {
  path = find_in_parent_folders("terragrunt.root.hcl")

  expose = true
}

/**
  * We define the dependencies for this stage. These are the modules that this stage depends on.
  * this enables us to use the outputs of these modules in the configuration of this stage. It
  * also enables us to use plann-all, init-all, and apply-all to run TG commands in all of the
  *  stages in the correct order.
  */
// dependencies {
//   paths = include.root.locals.use_local_state ? [] : [
//     "../provision",
//     "../chatbot",
//   ]
// }

// /**
//   * Dependency blocks allow us to mock outputs from previous stages so that we can
//   * validate, init, and manage state in dependant modules without having to apply
//   * the previous stages.
//   */
// dependency "provision" {
//   config_path = "../provision"

//   mock_outputs_allowed_terraform_commands = ["validate", "init", "state"]
//   mock_outputs                            = local.config.mock_outputs.provision
// }

// dependency "chatbot" {
//   config_path = "../chatbot"

//   mock_outputs_allowed_terraform_commands = ["validate", "init", "state"]
//   mock_outputs                            = local.config.mock_outputs.chatbot
// }

/**
  * We can override the root config with local configuration options if we need to.
  */
locals {
  short_helpline = include.root.locals.config.short_helpline
  environment = include.root.locals.config.environment
  lex_bot_languages = include.root.locals.config.lex_bot_languages
  enable_lex_v2 = include.root.locals.config.enable_lex_v2

  lex_bots = tomap({
    for language, bots in local.lex_bot_languages :
    language => merge(
      [
        for bot in bots :
          fileexists("/app/twilio-iac/helplines/${local.short_helpline}/configs/lex/${language}/bots/${bot}.json") ?
          jsondecode(file("/app/twilio-iac/helplines/${local.short_helpline}/configs/lex/${language}/bots/${bot}.json")) :
          fileexists("/app/twilio-iac/helplines/${local.short_helpline}/configs/lex/common/bots/${bot}.json") ?
          jsondecode(file("/app/twilio-iac/helplines/${local.short_helpline}/configs/lex/common/bots/${bot}.json")) :
          fileexists("/app/twilio-iac/helplines/configs/lex/${language}/bots/${bot}.json") ?
          jsondecode(file("/app/twilio-iac/helplines/configs/lex/${language}/bots/${bot}.json")) :
          jsondecode(file("/app/twilio-iac/helplines/configs/lex/${substr(language, 0, 2)}/bots/${bot}.json"))
      ]...
    )
  })

  lex_intents = tomap({
    for language, bots in local.lex_bot_languages :
      language => merge(
        [
          for bot in bots :
            fileexists("/app/twilio-iac/helplines/${local.short_helpline}/configs/lex/${language}/intents/${bot}.json") ?
            jsondecode(file("/app/twilio-iac/helplines/${local.short_helpline}/configs/lex/${language}/intents/${bot}.json")) :
            fileexists("/app/twilio-iac/helplines/${local.short_helpline}/configs/lex/common/intents/${bot}.json") ?
            jsondecode(file("/app/twilio-iac/helplines/${local.short_helpline}/configs/lex/common/intents/${bot}.json")) :
            fileexists("/app/twilio-iac/helplines/configs/lex/${language}/intents/${bot}.json") ?
            jsondecode(file("/app/twilio-iac/helplines/configs/lex/${language}/intents/${bot}.json")) :
            jsondecode(file("/app/twilio-iac/helplines/configs/lex/${substr(language, 0, 2)}/intents/${bot}.json"))
        ]...
      )
  })



  slot_types_names = tomap({
    for language, bots in local.lex_bot_languages :
      language => distinct(
        flatten([
          for obj_key, obj_value in local.lex_intents[language] : [
            for slot_name, slot_data in obj_value["slots"] :
             slot_data["slot_type"] if !startswith(slot_data["slot_type"], "AMAZON.")
          ]
        ])
      )
  })

  lex_slot_types = tomap({
    for language, bots in local.lex_bot_languages :
      language => merge(
        [
          for slot_type in local.slot_types_names[language] :
          fileexists("/app/twilio-iac/helplines/${local.short_helpline}/configs/lex/${language}/slot_types/${slot_type}.json") ?
          jsondecode(file("/app/twilio-iac/helplines/${local.short_helpline}/configs/lex/${language}/slot_types/${slot_type}.json")) :
          fileexists("/app/twilio-iac/helplines/${local.short_helpline}/configs/lex/common/slot_types/${slot_type}.json") ?
          jsondecode(file("/app/twilio-iac/helplines/${local.short_helpline}/configs/lex/common/slot_types/${slot_type}.json")) :
          fileexists("/app/twilio-iac/helplines/configs/lex/${language}/slot_types/${slot_type}.json") ?
          jsondecode(file("/app/twilio-iac/helplines/configs/lex/${language}/slot_types/${slot_type}.json")) :
          jsondecode(file("/app/twilio-iac/helplines/configs/lex/${substr(language, 0, 2)}/slot_types/${slot_type}.json"))
        ]...
      )
  })
  
  lex_v2_bots = local.enable_lex_v2 ? tomap({
    for language, bots in local.lex_bot_languages :
    language => merge(
      [
        for bot in bots :
          fileexists("/app/twilio-iac/helplines/${local.short_helpline}/configs/lex/${language}/bots/${bot}.json") ?
          jsondecode(file("/app/twilio-iac/helplines/${local.short_helpline}/configs/lex/${language}/bots/${bot}.json")) :
          fileexists("/app/twilio-iac/helplines/${local.short_helpline}/configs/lex/common/bots/${bot}.json") ?
          jsondecode(file("/app/twilio-iac/helplines/${local.short_helpline}/configs/lex/common/bots/${bot}.json")) :
          fileexists("/app/twilio-iac/helplines/configs/lex/${language}/bots/${bot}.json") ?
          jsondecode(file("/app/twilio-iac/helplines/configs/lex/${language}/bots/${bot}.json")) :
          jsondecode(file("/app/twilio-iac/helplines/configs/lex/${substr(language, 0, 2)}/bots/${bot}.json"))
      ]...
    )
  }) : {}

  lex_v2_slot_types_names = local.enable_lex_v2 ? tomap({
    for language, bots in local.lex_bot_languages :
      language => distinct(
        flatten([
          for bot_name, bot_config in lex_v2_bots[language] : [
            for slot_type in bot_config.slot_types : 
              {
                bot_name = bot_name,
                name = slot_type
              }           
          ]
        ])
      )
  }) : {}

  lex_v2_slot_types = local.enable_lex_v2 ? tomap({
    for language, bots in local.lex_bot_languages :
      language => merge(
        [
          for slot_type in local.lex_v2_slot_types_names[language] :{
          bot_name = slot_type.bot_name,
          slot_type_config = (
            fileexists("/app/twilio-iac/helplines/${local.short_helpline}/configs/lex/${language}/slot_types/${slot_type.name}.json") 
            ? jsondecode(file("/app/twilio-iac/helplines/${local.short_helpline}/configs/lex/${language}/slot_types/${slot_type.name}.json")) 

            : fileexists("/app/twilio-iac/helplines/${local.short_helpline}/configs/lex/common/slot_types/${slot_type.name}.json") 
            ? jsondecode(file("/app/twilio-iac/helplines/${local.short_helpline}/configs/lex/common/slot_types/${slot_type.name}.json")) 

            : fileexists("/app/twilio-iac/helplines/configs/lex/${language}/slot_types/${slot_type.name}.json") 
            ? jsondecode(file("/app/twilio-iac/helplines/configs/lex/${language}/slot_types/${slot_type.name}.json")) 

            : jsondecode(file("/app/twilio-iac/helplines/configs/lex/${substr(language, 0, 2)}/slot_types/${slot_type.name}.json"))
          )
        }
        ]...
      )

  })



  lex_v2_intents = {}
/*
  lex_v2_intents = local.enable_lex_v2 ? tomap({
    for language, bots in local.lex_bot_languages :
      language => merge(
        [
          for bot in bots :
            fileexists("/app/twilio-iac/helplines/${local.short_helpline}/configs/lex/${language}/intents/${bot}.json") ?
            jsondecode(file("/app/twilio-iac/helplines/${local.short_helpline}/configs/lex/${language}/intents/${bot}.json")) :
            fileexists("/app/twilio-iac/helplines/${local.short_helpline}/configs/lex/common/intents/${bot}.json") ?
            jsondecode(file("/app/twilio-iac/helplines/${local.short_helpline}/configs/lex/common/intents/${bot}.json")) :
            fileexists("/app/twilio-iac/helplines/configs/lex/${language}/intents/${bot}.json") ?
            jsondecode(file("/app/twilio-iac/helplines/configs/lex/${language}/intents/${bot}.json")) :
            jsondecode(file("/app/twilio-iac/helplines/configs/lex/${substr(language, 0, 2)}/intents/${bot}.json"))
        ]...
      )
  }) : {}
*/
  local_config = {
    lex_bots = local.lex_bots
    lex_intents = local.lex_intents
    lex_slot_types = local.lex_slot_types
    lex_v2_bots = local.lex_v2_bots
    lex_v2_intents = local.lex_v2_intents
    lex_v2_slot_types = local.lex_v2_slot_types
  }

  config = merge(include.root.locals.config, local.local_config)
}

/**
  * This sets the variables that are fed into the stage module to be the combined config at local.config
  */
inputs = local.config

/**
  * This is the main terragrunt block that defines the stage module and the hooks that run before it.
  */
terraform {
  source = "../../terraform-modules//stages/${include.root.locals.stage}"
}