migrate-state:
	docker run -it --rm $(DEFAULT_ARGS) $(TG_ENV) $(DOCKER_IMAGE):$(TF_VER) $(TF_ROOT_PATH)/scripts/migration/state/main.sh $(HL_ENV) $(HL) $(MY_ENV)
