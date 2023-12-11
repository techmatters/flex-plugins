shell:
	docker run -it --rm $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) bash

shell-assume-role: export-aws-credentials shell
