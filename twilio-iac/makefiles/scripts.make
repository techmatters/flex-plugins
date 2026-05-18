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

init-scripts: install-scripts

install-scripts:
	docker run -it --rm \
  -v $(TF_PLUGIN_CACHE_HOST):$(TF_PLUGIN_CACHE_CONT) \
  $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) $(TF_ROOT_PATH)/scripts/deploy-scripts/install.sh

compile-scripts:
	docker run -it --rm \
  -v $(TF_PLUGIN_CACHE_HOST):$(TF_PLUGIN_CACHE_CONT) \
  $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) $(TF_ROOT_PATH)/scripts/deploy-scripts/compile.sh
