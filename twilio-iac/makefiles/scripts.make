setup-new-environment: manage-ssm-secrets init twilio-resources-import-account-defaults apply

manage-ssm-secrets:
	docker run -it --rm $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) $(TF_ROOT_PATH)/scripts/secretManager/manageSecrets.py $(MY_ENV)

twilio-resources-import-account-defaults:
	docker run -it --rm $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) $(TF_ROOT_PATH)/scripts/twilioResourceImportAccountDefaults.sh $(MY_ENV)

init-scripts: install-scripts compile-scripts

install-scripts:
	docker run -it --rm $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) $(TF_ROOT_PATH)/scripts/installScripts.sh $(MY_ENV)

compile-scripts:
	docker run -it --rm $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) $(TF_ROOT_PATH)/scripts/compileScripts.sh $(MY_ENV)
