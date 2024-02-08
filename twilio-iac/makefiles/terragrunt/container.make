##@ Container Utilities

shell: ## Run a shell in the terragrunt container
	docker run -it --rm $(DEFAULT_ARGS) $(TG_ENV) $(DOCKER_IMAGE):$(TF_VER) bash
