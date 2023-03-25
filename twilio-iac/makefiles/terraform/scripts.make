setup-new-environment: manage-ssm-secrets init twilio-resources-import-account-defaults apply

manage-ssm-secrets:
	docker run -it --rm $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) $(TF_ROOT_PATH)/scripts/secretManager/manageSecrets.py $(MY_ENV)

twilio-resources-import-account-defaults:
	docker run -it --rm $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) $(TF_ROOT_PATH)/scripts/deploy-scripts/terraform/twilioResourceImportAccountDefaults.sh
