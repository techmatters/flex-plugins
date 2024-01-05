##@ Utility

# This prints help commands based on the comments in Makefiles.
# Descriptions of targets are expected to be on the same line as the target, and to be prefixed with `##`.
# Other blocks are expected to be on a line by themselves, and to be prefixed with `##@`.

help: ## Display this help
	@awk 'BEGIN {FS = ":.*##";} /^[$$()% 0-9a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)