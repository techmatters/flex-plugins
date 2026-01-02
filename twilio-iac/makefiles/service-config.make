##@ Service Config Manager - Usage: make [target] HL=[hl short code] HL_ENV=[hl environment]
TF_PLUGIN_CACHE_CONT = /terraform-provider-cache

ifeq ($(origin TF_PLUGIN_CACHE_HOST), undefined)
  $(info Terraform plugin cache directory not explicitly provided, looking for defaults)
  ifneq ($(wildcard /opt/terraform-provider-cache),)
    TF_PLUGIN_CACHE_HOST := /opt/terraform-provider-cache
  else ifneq ($(wildcard $(HOME)/terraform-provider-cache),)
    TF_PLUGIN_CACHE_HOST := $(HOME)/terraform-provider-cache
  else
    $(error Terraform plugin cache directory not found, please make sure one of the default locations is present or explicitly provide one)
  endif
else
  ifeq ($(wildcard $(TF_PLUGIN_CACHE_HOST)),)
    $(error Terraform plugin cache directory does not exist: $(TF_PLUGIN_CACHE_HOST))
  endif
endif

$(info Terraform plugin cache directory: $(TF_PLUGIN_CACHE_HOST))

service-config-show: ## Show the current remote service configuration, local service configuration, and the plan to sync them
	docker run -it --rm \
  -v $(TF_PLUGIN_CACHE_HOST):$(TF_PLUGIN_CACHE_CONT) \
  $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) $(TF_ROOT_PATH)/scripts/python_tools/manageServiceConfig.py show

service-config-show-remote: ## Show the current remote service configuration
	docker run -it --rm \
  -v $(TF_PLUGIN_CACHE_HOST):$(TF_PLUGIN_CACHE_CONT) \
  $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) $(TF_ROOT_PATH)/scripts/python_tools/manageServiceConfig.py show_remote

service-config-plan: ## Show the plan to sync the local service configuration with the remote service configuration
	docker run -it --rm \
  -v $(TF_PLUGIN_CACHE_HOST):$(TF_PLUGIN_CACHE_CONT) \
  $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) $(TF_ROOT_PATH)/scripts/python_tools/manageServiceConfig.py plan

service-config-apply: ## Apply the plan to sync the local service configuration with the remote service configuration
	docker run -it --rm \
  -v $(TF_PLUGIN_CACHE_HOST):$(TF_PLUGIN_CACHE_CONT) \
  $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) $(TF_ROOT_PATH)/scripts/python_tools/manageServiceConfig.py apply

service-config-unlock: ## Unlock the remote service configuration
	docker run -it --rm \
  -v $(TF_PLUGIN_CACHE_HOST):$(TF_PLUGIN_CACHE_CONT) \
  $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) $(TF_ROOT_PATH)/scripts/python_tools/manageServiceConfig.py unlock

service-config-sync-plan:	## Show the plan to update the local json to match the remote service configuration
	docker run -it --rm \
  -v $(TF_PLUGIN_CACHE_HOST):$(TF_PLUGIN_CACHE_CONT) \
  $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) $(TF_ROOT_PATH)/scripts/python_tools/manageServiceConfig.py sync_plan

service-config-sync-apply: ## Apply the plan to update the local json to match the remote service configuration
	docker run -it --rm \
  -v $(TF_PLUGIN_CACHE_HOST):$(TF_PLUGIN_CACHE_CONT) \
  $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) $(TF_ROOT_PATH)/scripts/python_tools/manageServiceConfig.py sync_apply

service-config-show-flags: ## Show just the feature and config flags in service configuration
	docker run -it --rm \
  -v $(TF_PLUGIN_CACHE_HOST):$(TF_PLUGIN_CACHE_CONT) \
  $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) $(TF_ROOT_PATH)/scripts/python_tools/manageServiceConfig.py show_flags

service-config-generate-flags-matrix: ## Generate 'Flags Matrix' gsheet for all accounts
	docker run -it --rm \
  -v $(TF_PLUGIN_CACHE_HOST):$(TF_PLUGIN_CACHE_CONT) \
  $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) $(TF_ROOT_PATH)/scripts/python_tools/manageServiceConfig.py generate_flags_matrix
