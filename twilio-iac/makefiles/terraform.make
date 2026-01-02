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

apply-tf:
	docker run -it --rm \
  -v $(TF_PLUGIN_CACHE_HOST):$(TF_PLUGIN_CACHE_CONT) \
  $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) terraform apply $(tf_args)

get-tf:
	docker run -it --rm \
  -v $(TF_PLUGIN_CACHE_HOST):$(TF_PLUGIN_CACHE_CONT) \
  $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) terraform get --update $(tf_args)

init-tf:
	docker run -it --rm \
  -v $(TF_PLUGIN_CACHE_HOST):$(TF_PLUGIN_CACHE_CONT) \
  $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) terraform init $(tf_args)

plan-tf:
	docker run -it --rm \
  -v $(TF_PLUGIN_CACHE_HOST):$(TF_PLUGIN_CACHE_CONT) \
  $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) terraform plan $(tf_args)

destroy-tf:
	docker run -it --rm \
  -v $(TF_PLUGIN_CACHE_HOST):$(TF_PLUGIN_CACHE_CONT) \
  $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) terraform destroy $(tf_args)

validate-tf:
	docker run -it --rm \
  -v $(TF_PLUGIN_CACHE_HOST):$(TF_PLUGIN_CACHE_CONT) \
  $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) terraform validate $(tf_args)
