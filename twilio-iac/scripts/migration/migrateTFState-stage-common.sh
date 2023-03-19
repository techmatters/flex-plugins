#!/usr/bin/env bash

set -e

export TERRAGRUNT_AUTO_INIT=false

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
  echo "Will remove the following resources from Terraform state:"
  echo "$resource_list"

  printf "\n\n"

  read -p "Do you want to remove the preceeding resources from the state?(y/N)" -n 1 -r
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Deleting resources from tf state"

    # echo $resource_list | sed -e 's/"/\\\\\\"/g' -e "s/'/\\\\\\\\\\\'/g" -e 's/!/\\\\!/g' | xargs -I {} terragrunt state rm --terragrunt-log-level debug --terragrunt-debug {}
    for resource in  $resource_list; do
      escaped_resource=$(echo $resource | sed -e "s/'/\\\'/g")
      terragrunt state rm $escaped_resource
    done
    # echo $resource_list | xargs -I {} terragrunt state rm --terragrunt-log-level debug --terragrunt-debug {}
    echo "Done!"
  else
    echo "Aborting..."
    exit 1
  fi
else
  echo "No resources matching the specified patterns found in Terraform state"
fi
