##@ Terraform Targets

apply: verify-pre-work apply-tf ## Apply the current terraform config

get: get-tf ## Get modules for the current terraform config

init: verify-pre-work init-scripts init-tf ## Initialize the current terraform config

plan: verify-pre-work plan-tf ## Plan the current terraform config

destroy: destroy-tf ## Destroy the current terraform config

validate: validate-tf ## Validate the current terraform config
