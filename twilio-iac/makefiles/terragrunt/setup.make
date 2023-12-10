##@ Account Setup/Migration Scripts

setup-new-environment: verify-env init manage-ssm-secrets twilio-resources-import-account-defaults ## Setup a new environment

manage-ssm-secrets: verify-env ## Manage SSM secrets needed for the environment
	docker run -it --rm $(DEFAULT_ARGS) $(TG_ENV) $(DOCKER_IMAGE):$(TF_VER) $(TF_ROOT_PATH)/scripts/python_tools/manageSecrets.py "$(HL_ENV)/$(HL)"

twilio-resources-import-account-defaults: verify-env
	docker run -it --rm $(DEFAULT_ARGS) $(TG_ENV) $(DOCKER_IMAGE):$(TF_VER) $(TF_ROOT_PATH)/scripts/deploy-scripts/terragrunt/twilioResourceImportAccountDefaults.sh

migrate-state: verify-env
	docker run -it --rm $(DEFAULT_ARGS) $(TG_ENV) $(DOCKER_IMAGE):$(TF_VER) $(TF_ROOT_PATH)/scripts/migration/state/main.sh $(HL_ENV) $(HL) $(MY_ENV)
