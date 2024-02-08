##@ Container Utilities

shell: ## Run a shell in the terraform container
	docker run -it --rm $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) bash
