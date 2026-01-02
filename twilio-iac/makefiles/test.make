##@ Test and Lint
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

lint: fmt-check tflint tfsec ## Run all linting tools

fmt-check: ## Check if the terraform files are formatted correctly
	docker run -it --rm \
  -v $(TF_PLUGIN_CACHE_HOST):$(TF_PLUGIN_CACHE_CONT) \
  -v $(GIT_ROOT)/terraform:/app $(DOCKER_IMAGE):$(TF_VER) terraform fmt -recursive -write=false -diff $(tf_args)

fmt-fix: ## Fix the formatting of the terraform files
	docker run -it --rm \
  -v $(TF_PLUGIN_CACHE_HOST):$(TF_PLUGIN_CACHE_CONT) \
  -v $(GIT_ROOT)/terraform:/app $(DOCKER_IMAGE):$(TF_VER) terraform fmt -recursive $(tf_args)

hclfmt: ## Fix the format of all HCL files globally
	docker run -it --rm \
  -v $(TF_PLUGIN_CACHE_HOST):$(TF_PLUGIN_CACHE_CONT) \
  -v $(GIT_ROOT):$(MOUNT_PATH) -w $(TF_ROOT_PATH) $(TG_ENV) $(DOCKER_IMAGE):$(TF_VER) terragrunt hclfmt $(tg_args)

tflint: ## Run tflint on the terraform files
	docker run -it --rm \
  -v $(TF_PLUGIN_CACHE_HOST):$(TF_PLUGIN_CACHE_CONT) \
  -v $(GIT_ROOT)/terraform:/data -e TFLINT_LOG=warn ghcr.io/terraform-linters/tflint-bundle --recursive

tfsec: ## Run tfsec on the terraform files to check for security issues
	docker run -it --rm \
  -v $(TF_PLUGIN_CACHE_HOST):$(TF_PLUGIN_CACHE_CONT) \
  -v $(GIT_ROOT)/terraform:/src aquasec/tfsec /src

checkov: ## Run checkov on the terraform files to check for security issues
	docker run -it --rm \
  -v $(TF_PLUGIN_CACHE_HOST):$(TF_PLUGIN_CACHE_CONT) \
  -v $(GIT_ROOT)/terraform:/data bridgecrew/checkov -d /data

