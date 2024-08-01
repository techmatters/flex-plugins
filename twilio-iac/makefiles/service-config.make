##@ Service Config Manager - Usage: make [target] HL=[hl short code] HL_ENV=[hl environment]

service-config-show: ## Show the current remote service configuration, local service configuration, and the plan to sync them
	docker run -it --rm $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) $(TF_ROOT_PATH)/scripts/python_tools/manageServiceConfig.py show

service-config-show-remote: ## Show the current remote service configuration
	docker run -it --rm $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) $(TF_ROOT_PATH)/scripts/python_tools/manageServiceConfig.py show_remote

service-config-show-flags: ## Show the current remote service configuration
	docker run -it --rm $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) $(TF_ROOT_PATH)/scripts/python_tools/manageServiceConfig.py show_flags

service-config-show-flags-by-account: ## Show the current remote service configuration
	docker run -it --rm $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) $(TF_ROOT_PATH)/scripts/python_tools/manageServiceConfig.py show_flags_by_account

service-config-plan: ## Show the plan to sync the local service configuration with the remote service configuration
	docker run -it --rm $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) $(TF_ROOT_PATH)/scripts/python_tools/manageServiceConfig.py plan

service-config-apply: ## Apply the plan to sync the local service configuration with the remote service configuration
	docker run -it --rm $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) $(TF_ROOT_PATH)/scripts/python_tools/manageServiceConfig.py apply

service-config-unlock: ## Unlock the remote service configuration
	docker run -it --rm $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) $(TF_ROOT_PATH)/scripts/python_tools/manageServiceConfig.py unlock

service-config-sync-plan:	## Show the plan to update the local json to match the remote service configuration
	docker run -it --rm $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) $(TF_ROOT_PATH)/scripts/python_tools/manageServiceConfig.py sync_plan

service-config-sync-apply: ## Apply the plan to update the local json to match the remote service configuration
	docker run -it --rm $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) $(TF_ROOT_PATH)/scripts/python_tools/manageServiceConfig.py sync_apply