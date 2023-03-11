migrate-state:
	docker run -it --init --rm $(DEFAULT_ARGS) $(TG_ENV) $(DOCKER_IMAGE):$(TF_VER) $(TF_ROOT_PATH)/scripts/migration/migrateTFState.sh $(HL_ENV) $(HL) $(MY_ENV)
