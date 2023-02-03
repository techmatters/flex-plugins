locals {
  base_config = jsondecode(file("../../helplines/${get_env("HL")}/base.json"))
  env_config  = jsondecode(file("../../helplines/${get_env("HL")}/${get_env("HL_ENV")}/provision.json"))
}

