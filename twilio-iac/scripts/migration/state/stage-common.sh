#!/usr/bin/env bash

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

function moveResources {
  for identifier in "${move_identifiers[@]}"; do
    OLD_IFS=$IFS
    IFS=','
    from_to_array=($identifier)
    echo "Moving resource ${from_to_array[0]} to ${from_to_array[1]}"

    printf "Getting list of all resources in Terraform state..."
    full_resource_list=$(terragrunt state list)
    printf "Done!\n\n"

    echo "checking if from resource: ${from_to_array[0]} exists"
    escaped_from_resource=$(echo "${from_to_array[0]}" | sed -e "s/\"/\\\"/g")
    from_resource_exists=$(echo "$full_resource_list" | grep -F $escaped_from_resource)
    if [ -n "$from_resource_exists" ]; then
      echo "From resource exists in the state. Checking if to resource: ${from_to_array[1]} exists"
      escaped_to_resource=$(echo "${from_to_array[1]}" | sed -e "s/\"/\\\"/g")
      to_resource_exists=$(echo "$full_resource_list" | grep -F $escaped_to_resource)
      if [ -n "$to_resource_exists" ]; then
        echo "Both resources exist in the state. Skipping."
        continue
      fi

      echo "Moving resource ${from_to_array[0]} to ${from_to_array[1]}"
      terragrunt state mv ${from_to_array[0]} ${from_to_array[1]}

    else
      echo "From resource does not exist in the state. Skipping."
    fi

    IFS=$OLD_IFS
  done
}

function deleteResources {
  set -e

  printf "Getting list of all resources in Terraform state..."
  full_resource_list=$(terragrunt state list)
  printf "Done!\n\n"

  printf "Filtering resources matching the patterns:"
  for identifier in "${delete_identifiers[@]}"; do
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

      for resource in  $resource_list; do
        terragrunt state rm $resource
      done
      echo "Done!"
  else
    echo "No resources matching the specified patterns found in Terraform state"
  fi
}

moveResources

for ((i=1; i<=$RETRY_COUNT; i++)); do
  if deleteResources; then
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