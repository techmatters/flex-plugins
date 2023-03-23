#!/usr/bin/env bash

set -e

# set to 1 to verify the list of resources to be removed from the state
VERIFY_LIST=1
RETRY_COUNT=5

export USE_LOCAL_STATE=true

echo "Runing terragrunt init -reconfigure to use local state..."
terragrunt init -reconfigure

export TERRAGRUNT_AUTO_INIT=false

function verifyList {
  if [ $VERIFY_LIST -eq 0 ]; then
    return
  fi
  echo "Will remove the following resources from Terraform state:"
  echo "$resource_list"

  printf "\n\n"

  read -p "Do you want to remove the preceeding resources from the state?(y/N)" -n 1 -r
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborting..."
    exit 1
  fi
  echo "Continuing."
  VERIFY_LIST=0
}

function removeResources {
  printf "Getting list of all resources in Terraform state..."
  full_resource_list=$(terragrunt state list)
  printf "Done!\n\n"

  printf "Filtering resources matching the patterns:"
  for identifier in "${identifiers[@]}"; do
    matched_resources=$(echo "$full_resource_list" | grep -E "$identifier" || true)
    if [ -n "$matched_resources" ]; then
      resource_list+="$matched_resources"$'\n'
    fi
  done
  printf "Done!\n\n"

  IFS=$'\n'

  if [ -n "$resource_list" ]; then
      verifyList

      echo "Deleting resources from tf state"

      # echo $resource_list | sed -e 's/"/\\\\\\"/g' -e "s/'/\\\\\\\\\\\'/g" -e 's/!/\\\\!/g' | xargs -I {} terragrunt state rm --terragrunt-log-level debug --terragrunt-debug {}
      for resource in  $resource_list; do
        escaped_resource=$resource # $(echo $resource | sed -e "s/'/\\\'/g")
        terragrunt state rm $escaped_resource
      done
      # echo $resource_list | xargs -I {} terragrunt state rm --terragrunt-log-level debug --terragrunt-debug {}
      echo "Done!"
  else
    echo "No resources matching the specified patterns found in Terraform state"
  fi
}

for ((i=1; i<=$RETRY_COUNT; i++)); do
  if removeResources; then
    echo "Function succeeded"
    break
  else
    echo "Function failed, retrying..."
    if [ $i -eq $RETRY_COUNT ]; then
      echo "Function failed after $RETRY_COUNT retries"
      exit 1
    fi
  fi
done