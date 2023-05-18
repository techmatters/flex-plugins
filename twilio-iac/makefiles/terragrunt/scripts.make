setup-new-environment: init manage-ssm-secrets twilio-resources-import-account-defaults

manage-ssm-secrets:
	docker run -it --rm $(DEFAULT_ARGS) $(TG_ENV) $(DOCKER_IMAGE):$(TF_VER) $(TF_ROOT_PATH)/scripts/secretManager/manageSecrets.py "$(HL_ENV)/$(HL)"

twilio-resources-import-account-defaults:
	docker run -it --rm $(DEFAULT_ARGS) $(TG_ENV) $(DOCKER_IMAGE):$(TF_VER) $(TF_ROOT_PATH)/scripts/deploy-scripts/terragrunt/twilioResourceImportAccountDefaults.sh

migrate-state:
	docker run -it --rm $(DEFAULT_ARGS) $(TG_ENV) $(DOCKER_IMAGE):$(TF_VER) $(TF_ROOT_PATH)/scripts/migration/state/main.sh $(HL_ENV) $(HL) $(MY_ENV)

verify-pre-work:
	docker run -it --rm $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) $(TF_ROOT_PATH)/scripts/verifyPreWork.sh $(HL) $(HL_ENV) $(MY_ENV)