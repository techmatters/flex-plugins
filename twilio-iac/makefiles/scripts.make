setup-new-environment: manage-ssm-secrets init twilio-resources-import-account-defaults apply

manage-ssm-secrets:
	docker run -it --rm $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) ../scripts/secretManager/manageSecrets.py $(MY_ENV)

twilio-resources-import-account-defaults:
	docker run -it --rm $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) ../scripts/twilioResourceImportAccountDefaults.sh $(MY_ENV)

noop-serverless-url:
	docker run -it --rm $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) ../scripts/noop/getServerlessUrl.sh $(MY_ENV)
