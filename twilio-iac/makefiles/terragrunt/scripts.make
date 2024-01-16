verify-pre-work: verify-env
	docker run -it --rm $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) $(TF_ROOT_PATH)/scripts/verifyPreWork.sh $(HL) $(HL_ENV) $(MY_ENV)