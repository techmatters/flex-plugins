manage-ssm-secrets:
	docker run -it --rm $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) ../scripts/secretManager/manageSecrets.py $(MY_ENV)
