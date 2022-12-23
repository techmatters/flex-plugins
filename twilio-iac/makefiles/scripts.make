init-ssm-secrets:
	docker run -it --rm $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) ../scripts/secretManager/initSecrets.py $(MY_ENV)
