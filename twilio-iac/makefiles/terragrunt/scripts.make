migrate-state:
	docker run -it --rm $(DEFAULT_ARGS) $(TG_ENV) $(DOCKER_IMAGE):$(TF_VER) /app/twilio-iac/scripts/migration/migrateTFState.sh $(HL_ENV) $(HL) $(MY_ENV)
